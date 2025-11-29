/* =============================
   CONFIG
============================= */

const STORAGE_KEY = "lastProcessedEmailId";
const SPAM_KEY = "spamResults";
const CATEGORY_KEY = "categorizedEmails";
let isFetching = false;

/* =============================
   AUTHENTICATION
============================= */

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject("No token found or login failed");
      } else {
        resolve(token);
      }
    });
  });
}

/* =============================
   GMAIL API HELPERS
============================= */

async function fetchMessageList(token) {
  const resp = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await resp.json();
  return data.messages || [];
}

async function fetchFullMessage(token, id) {
  try {
    const resp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

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

/* =============================
   CONCURRENCY UTILITY
============================= */

async function fetchWithConcurrency(list, fn, limit = 10) {
  const results = [];

  for (let i = 0; i < list.length; i += limit) {
    const chunk = list.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

/* =============================
   BACKEND SENDING
============================= */

async function sendToBackend(emails) {
  if (!emails.length) return { spam: [], categories: [] };

  const response = await fetch("http://127.0.0.1:8000/api/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emails),
  });

  const data = await response.json();

  return {
    spam: data.spam_results || [],
    categories: data.categorized_results || []
  };
}

/* =============================
   MESSAGE DIFFING
============================= */

function getNewMessages(messages, lastId, initial) {
  if (!lastId || initial) return messages;

  const index = messages.findIndex(m => m.id === lastId);
  return index >= 0 ? messages.slice(0, index) : messages;
}

/* =============================
   MAIN PROCESSOR
============================= */

async function fetchAndProcessEmails(initial = false) {

  if (isFetching) {
    console.log("⛔ Fetch skipped — already running");
    return;
  }

  isFetching = true;
  console.log("🔒 START fetch cycle");

  try {
    const token = await getAuthToken();
    console.log("✅ Auth token acquired");

    const messages = await fetchMessageList(token);
    console.log(`📥 Gmail returned ${messages.length} messages`);

    const stored = await chrome.storage.local.get([STORAGE_KEY, SPAM_KEY, CATEGORY_KEY]);
    const lastId = stored[STORAGE_KEY] || null;

    const existingSpam = stored[SPAM_KEY] || [];
    const existingCategories = stored[CATEGORY_KEY] || [];

    const newMessages = getNewMessages(messages, lastId, initial);
    console.log(`🆕 New unseen emails: ${newMessages.length}`);

    if (!newMessages.length) {
      console.log("No new emails.");
      return;
    }

    const emails = await fetchWithConcurrency(
      newMessages,
      (m) => fetchFullMessage(token, m.id),
      10
    );

    console.log("📦 Fetched email bodies:", emails.map(e => e.id));

    const { spam, categories } = await sendToBackend(emails);
    console.log("🔎 Backend spam results:", spam);
    console.log("🏷 Backend categorized:", categories);

    /* ---- STORE SPAM RESULTS ---- */
    if (spam.length) {
      const mergedSpam = [
        ...existingSpam,
        ...spam.filter(e => !existingSpam.some(ex => ex.id === e.id))
      ];
      await chrome.storage.local.set({ [SPAM_KEY]: mergedSpam });
      console.log(`📑 Stored ${mergedSpam.length} spam/not_spam results`);
    }

    /* ---- STORE CATEGORY RESULTS ---- */
    if (categories.length) {
      const mergedCat = [
        ...existingCategories,
        ...categories.filter(e => !existingCategories.some(ex => ex.id === e.id))
      ];
      await chrome.storage.local.set({ [CATEGORY_KEY]: mergedCat });
      console.log(`🏷 Stored ${mergedCat.length} categorized emails`);
    }

    /* ---- UPDATE LAST PROCESSED ID ---- */
    if (messages.length) {
      await chrome.storage.local.set({ [STORAGE_KEY]: messages[0].id });
      console.log(`📝 Updated last processed ID: ${messages[0].id}`);
    }

  } catch (err) {
    console.error("❌ ERROR:", err);

  } finally {
    isFetching = false;
    console.log("🔓 END fetch cycle");
  }
}

/* =============================
   EVENTS
============================= */

chrome.runtime.onInstalled.addListener(() => fetchAndProcessEmails(true));

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "fetchEmails") {
    fetchAndProcessEmails(false);
  }
});
