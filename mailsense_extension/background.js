const LAST_EMAIL_KEY = "lastProcessedEmailId";
const SPAM_KEY = "spamResults";
const CATEGORY_KEY = "categorizedEmails";
const CLUSTER_VERSION_KEY = "clusterVersion";
const CATEGORY_LABEL_MAP_KEY = "categoryLabelMap";
const LABELED_EMAILS_KEY = "labeledEmails";

let isFetching = false;

// Auth
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) reject(new Error("No token found or login failed"));
      else resolve(token);
    });
  });
}

// Gmail helpers
async function fetchMessageList(token) {
  const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await resp.json();
  return data.messages || [];
}

async function fetchFullMessage(token, id) {
  try {
    const resp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const msgData = await resp.json();
    const headers = msgData?.payload?.headers || [];
    const subject = headers.find(h => h.name === "Subject")?.value || "(no subject)";
    const body = msgData.snippet || "";
    return { id, subject, body };
  } catch (err) {
    console.warn(`Failed to fetch message ${id}:`, err);
    return { id, subject: "(error)", body: "" };
  }
}

// Utils
async function fetchWithConcurrency(list, fn, limit = 5) {
  const results = [];
  for (let i = 0; i < list.length; i += limit) {
    const chunk = list.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

function getNewMessages(messages, lastId, initial) {
  if (!lastId || initial) return messages;
  const index = messages.findIndex(m => m.id === lastId);
  return index >= 0 ? messages.slice(0, index) : messages;
}

// Backend communication
async function sendToBackend(emails) {
  if (!emails.length) return { spam: [], categories: [], clusterVersion: null };
  const response = await fetch("http://127.0.0.1:8000/api/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emails),
  });
  const data = await response.json();
  return {
    spam: data.spam_results || [],
    categories: data.categorized_results || [],
    clusterVersion: data.cluster_version ?? null
  };
}

// Storage init
async function ensureLabelMap() {
  const stored = await chrome.storage.local.get(CATEGORY_LABEL_MAP_KEY);
  if (!stored[CATEGORY_LABEL_MAP_KEY]) await chrome.storage.local.set({ [CATEGORY_LABEL_MAP_KEY]: {} });
}
ensureLabelMap().catch(console.error);

// Main fetch & process
async function fetchAndProcessEmails(initial = false) {
  if (isFetching) {
    console.log("⛔ Fetch skipped — already running");
    return;
  }
  isFetching = true;

  try {
    const token = await getAuthToken();
    const messages = await fetchMessageList(token);
    const stored = await chrome.storage.local.get([LAST_EMAIL_KEY, SPAM_KEY, CATEGORY_KEY, CLUSTER_VERSION_KEY, CATEGORY_LABEL_MAP_KEY, LABELED_EMAILS_KEY]);
    const lastId = stored[LAST_EMAIL_KEY] || null;
    const existingSpam = stored[SPAM_KEY] || [];
    const existingCategories = stored[CATEGORY_KEY] || [];
    const storedClusterVersion = stored[CLUSTER_VERSION_KEY] || null;

    const newMessages = getNewMessages(messages, lastId, initial);
    console.log(`Found ${newMessages.length} new messages`);

    if (!newMessages.length) return;

    const emails = await fetchWithConcurrency(newMessages, (m) => fetchFullMessage(token, m.id), 10);
    console.log("Fetched email bodies:", emails.map(e => e.id));

    const { spam, categories, clusterVersion } = await sendToBackend(emails);

    console.log("🔎 spam:", spam.length, " 🏷 categories:", categories.length, " clusterVersion:", clusterVersion);

    // Handle cluster version changes
    if (clusterVersion && clusterVersion !== storedClusterVersion) {
      console.log("Cluster version changed — clearing previous categories & labels");
      await chrome.storage.local.set({
        [CATEGORY_KEY]: [],
        [CATEGORY_LABEL_MAP_KEY]: {},
        [CLUSTER_VERSION_KEY]: clusterVersion,
        [LABELED_EMAILS_KEY]: []
      });
      await deleteAllExtensionLabels(token);
    } else if (clusterVersion) {
      await chrome.storage.local.set({ [CLUSTER_VERSION_KEY]: clusterVersion });
    }

    // Merge spam
    if (spam.length) {
      const mergedSpam = [...existingSpam, ...spam.filter(e => !existingSpam.some(ex => ex.id === e.id))];
      await chrome.storage.local.set({ [SPAM_KEY]: mergedSpam });
      console.log(`Stored ${mergedSpam.length} spam results`);
    }

    // Merge categories
    if (categories.length) {
      const mergedCat = [...existingCategories, ...categories.filter(e => !existingCategories.some(ex => ex.id === e.id))];
      await chrome.storage.local.set({ [CATEGORY_KEY]: mergedCat });
      console.log(`Stored ${mergedCat.length} categorized emails`);
    }

    // Update last processed ID
    if (messages.length) await chrome.storage.local.set({ [LAST_EMAIL_KEY]: messages[0].id });

    // Assign labels only to NEW emails
    await assignLabelsToAllEmails();

  } catch (err) {
    console.error("❌ ERROR in fetchAndProcessEmails:", err);
  } finally {
    isFetching = false;
    console.log("🔓 END fetch cycle");
  }
}

// Label management
async function getOrCreateLabel(category, token) {
  const name = String(category);
  const stored = await chrome.storage.local.get(CATEGORY_LABEL_MAP_KEY);
  const map = stored[CATEGORY_LABEL_MAP_KEY] || {};
  if (map[name]) return map[name];

  let labelId = null;
  const createResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/labels", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, labelListVisibility: "labelShow", messageListVisibility: "show" })
  });

  if (createResp.ok) {
    labelId = (await createResp.json()).id;
  } else {
    const listResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/labels", { headers: { Authorization: `Bearer ${token}` } });
    const found = (await listResp.json()).labels?.find(l => l.name === name);
    if (found) labelId = found.id;
    else throw new Error(`Failed to create label "${name}"`);
  }

  map[name] = labelId;
  await chrome.storage.local.set({ [CATEGORY_LABEL_MAP_KEY]: map });
  return labelId;
}

async function deleteLabel(labelId, token) {
  await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}

async function deleteAllExtensionLabels(token) {
  const stored = await chrome.storage.local.get(CATEGORY_LABEL_MAP_KEY);
  const map = stored[CATEGORY_LABEL_MAP_KEY] || {};
  const labelNames = Object.keys(map);
  if (!labelNames.length) return;

  const listResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/labels", { headers: { Authorization: `Bearer ${token}` } });
  const labels = (await listResp.json()).labels || [];
  for (const lbl of labels) if (labelNames.includes(lbl.name)) await deleteLabel(lbl.id, token);

  await chrome.storage.local.set({ [CATEGORY_LABEL_MAP_KEY]: {} });
}

// Apply labels with retry and batch
async function applyLabelToEmailWithRetry(messageId, labelId, token, maxRetries = 3) {
  let attempt = 0, backoff = 500;
  while (attempt <= maxRetries) {
    attempt++;
    try {
      const modResp = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ addLabelIds: [labelId] })
      });
      if (modResp.ok) return true;
      const text = await modResp.text();
      if (modResp.status === 429 || text.includes("rateLimitExceeded")) { await new Promise(r => setTimeout(r, backoff)); backoff *= 2; continue; }
      throw new Error(text || `Status ${modResp.status}`);
    } catch (err) {
      if (attempt > maxRetries) throw err;
      await new Promise(r => setTimeout(r, backoff));
      backoff *= 2;
    }
  }
  throw new Error("Max retries exceeded");
}

async function applyLabelsBatch(emailLabelPairs, token, concurrency = 2) {
  for (let i = 0; i < emailLabelPairs.length; i += concurrency) {
    const chunk = emailLabelPairs.slice(i, i + concurrency);
    await Promise.all(chunk.map(p => applyLabelToEmailWithRetry(p.id, p.labelId, token).catch(console.error)));
    await new Promise(r => setTimeout(r, 200));
  }
}

// Assigning labels to emails
async function assignLabelsToAllEmails() {
  try {
    const token = await getAuthToken();
    const stored = await chrome.storage.local.get([CATEGORY_KEY, CATEGORY_LABEL_MAP_KEY, LABELED_EMAILS_KEY]);
    const categorized = stored[CATEGORY_KEY] || [];
    const labelMapCache = stored[CATEGORY_LABEL_MAP_KEY] || {};
    const alreadyLabeled = new Set(stored[LABELED_EMAILS_KEY] || []);

    if (!categorized.length) return;

    // Only new emails
    const newEmails = categorized.filter(e => !alreadyLabeled.has(e.id));
    if (!newEmails.length) return;

    const categoryLabelMap = { ...labelMapCache };
    const uniqueCategories = [...new Set(newEmails.map(e => e.category))];
    for (const cat of uniqueCategories) if (!categoryLabelMap[cat]) categoryLabelMap[cat] = await getOrCreateLabel(cat, token);

    await chrome.storage.local.set({ [CATEGORY_LABEL_MAP_KEY]: categoryLabelMap });

    const emailLabelPairs = newEmails.map(e => ({ id: e.id, labelId: categoryLabelMap[e.category] })).filter(p => p.labelId);

    await applyLabelsBatch(emailLabelPairs, token, 2);

    await chrome.storage.local.set({ [LABELED_EMAILS_KEY]: [...alreadyLabeled, ...newEmails.map(e => e.id)] });

    console.log(`Labeled ${newEmails.length} new emails.`);
  } catch (err) {
    console.error("Error in assignLabelsToAllEmails:", err);
  }
}

// Events
chrome.runtime.onInstalled.addListener(() => fetchAndProcessEmails(true));

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg) return;
  if (msg.action === "fetchEmails") {
    fetchAndProcessEmails(false).catch(console.error);
    assignLabelsToAllEmails().catch(console.error);
  }
  if (msg.action === "deleteExtensionLabels") getAuthToken().then(token => deleteAllExtensionLabels(token)).catch(console.error);
});

chrome.action.onClicked.addListener(() => {
  console.log("Extension clicked — use messages to trigger fetch/label");
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openDashboard") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard/index.html")
    });
  }
});