/**
 * panel.js – MailSense panel
 * -----------------------------------
 * Spam toggle + category buttons using Gmail labels
 */

let spamFilterActive = false; // toggle state

const injectMailSensePanel = async () => {
  if (document.getElementById("mailsense-panel")) return;

  const container = document.querySelector("div.aeH");
  if (!container) return;

  const panel = document.createElement("div");
  panel.id = "mailsense-panel";
  panel.style.border = "1px solid #ccc";
  panel.style.padding = "12px";
  panel.style.margin = "10px 0";
  panel.style.borderRadius = "10px";
  panel.style.background = "#fafafa";
  panel.style.fontFamily = "Arial, sans-serif";

  const title = document.createElement("h3");
  title.textContent = "MailSense Filters";
  title.style.margin = "0 0 10px 0";
  panel.appendChild(title);

  /* --- SPAM BUTTON --- */
  const spamBtn = document.createElement("button");
  spamBtn.id = "spam-toggle-btn";
  spamBtn.textContent = "Show Spam";
  styleButton(spamBtn);
  spamBtn.style.background = "#ffe5e5";
  spamBtn.onclick = async () => toggleSpamFilter(spamBtn);
  panel.appendChild(spamBtn);

  /* --- CATEGORY SECTION --- */
  const catLabel = document.createElement("h4");
  catLabel.textContent = "Categories";
  catLabel.style.margin = "12px 0 3px 0";
  catLabel.style.fontSize = "14px";
  catLabel.style.opacity = "0.7";
  panel.appendChild(catLabel);

  const catContainer = document.createElement("div");
  panel.appendChild(catContainer);

  container.prepend(panel);

  await renderCategoryButtons(catContainer);
};

/* ---------------------------
   RENDER CATEGORY BUTTONS (label links)
---------------------------- */
async function renderCategoryButtons(container) {
  const stored = await chrome.storage.local.get("categorizedEmails");
  const categorizedEmails = stored.categorizedEmails || [];

  const categories = [
    "All",
    ...new Set(categorizedEmails.map(e => e.category))
  ];

  container.innerHTML = "";

  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    styleButton(btn);

    btn.onclick = () => {
  if (category === "All") {
    window.location.href = "https://mail.google.com/mail/u/0/#inbox";
  } else {
    // Replace spaces with + for Gmail label link
    const labelQuery = category.replace(/\s+/g, "+");
    window.location.href = `https://mail.google.com/mail/u/0/#label/${labelQuery}`;
  }
};

    container.appendChild(btn);
  });
}

/* ---------------------------
   SPAM TOGGLE
---------------------------- */
async function toggleSpamFilter(button) {
  const stored = await chrome.storage.local.get("spamResults");
  const spamResults = stored.spamResults || [];

  spamFilterActive = !spamFilterActive;

  if (spamFilterActive) {
    button.textContent = "Show All";
    button.style.background = "#ffb3b3";
    applySpamFilter(spamResults);
  } else {
    button.textContent = "Spam / Advertisement";
    button.style.background = "#ffe5e5";
    resetAllRows();
  }
}

function applySpamFilter(spamResults) {
  const rows = document.querySelectorAll("tr.zA");

  rows.forEach(row => {
    const id = row.querySelector("span[data-legacy-thread-id]")?.getAttribute("data-legacy-thread-id");
    const match = spamResults.find(e => e.id === id);
    row.style.display = match?.label === "spam" ? "" : "none";
  });

  console.log("🔍 Spam filter ON");
}

/* ---------------------------
   UTIL
---------------------------- */
function resetAllRows() {
  document.querySelectorAll("tr.zA").forEach(row => {
    row.style.display = "";
  });
}

function styleButton(btn) {
  btn.style.margin = "3px";
  btn.style.padding = "6px 10px";
  btn.style.border = "1px solid #888";
  btn.style.borderRadius = "6px";
  btn.style.background = "#fff";
  btn.style.cursor = "pointer";
  btn.onmouseenter = () => (btn.style.background = "#eee");
  btn.onmouseleave = () => {
    if (btn.id !== "spam-toggle-btn") btn.style.background = "#fff";
  };
}

/* ---------------------------
   INIT OBSERVER
---------------------------- */
const observer = new MutationObserver(() => {
  if (document.querySelector("tr.zA")) {
    injectMailSensePanel();
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
