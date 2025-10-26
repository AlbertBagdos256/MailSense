// content.js
// -------------------------------------------------------
// Observes Gmail DOM and injects MailSense panel with categories

// Function to notify background to fetch emails
const notifyBackground = () => {
  try {
    chrome.runtime.sendMessage({ action: "fetchEmails" });
    console.log("Notified background to fetch emails...");
  } catch (err) {
    console.warn("Failed to send message:", err);
  }
};

// Inject MailSense panel
const injectMailSensePanel = () => {
  // Avoid duplicate injection
  if (document.getElementById("mailsense-panel")) return;

  // Locate Gmail sidebar or top container
  const container = document.querySelector("div.aeH"); // you can adjust selector
  if (!container) return;

  const panel = document.createElement("div");
  panel.id = "mailsense-panel";
  panel.style.border = "1px solid #ccc";
  panel.style.padding = "10px";
  panel.style.margin = "10px 0";
  panel.style.borderRadius = "8px";
  panel.style.backgroundColor = "#f5f5f5";
  panel.style.fontFamily = "Arial, sans-serif";

  // Title
  const title = document.createElement("h3");
  title.textContent = "MailSense Categories";
  title.style.margin = "0 0 10px 0";
  panel.appendChild(title);

  // Fictional categories
  const categories = ["Work", "Personal", "Promotions", "Updates"];
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.style.margin = "3px";
    btn.style.padding = "5px 10px";
    btn.style.border = "1px solid #888";
    btn.style.borderRadius = "5px";
    btn.style.backgroundColor = "#fff";
    btn.style.cursor = "pointer";
    btn.onclick = () => alert(`Clicked category: ${cat}`);
    panel.appendChild(btn);
  });

  // Insert panel into Gmail
  container.prepend(panel);
};

// Initialize observer for Gmail inbox
const initInboxObserver = () => {
  const inbox = document.querySelector("div[role='main']");
  if (!inbox) return;

  const observer = new MutationObserver(() => {
    console.log("Inbox updated → new email possible");
    notifyBackground();
  });

  observer.observe(inbox, { childList: true, subtree: true });
  console.log("Inbox observer initialized.");
};

// Wait until Gmail inbox is fully loaded
const waitForInbox = () => {
  const interval = setInterval(() => {
    const inbox = document.querySelector("div[role='main']");
    const sidebar = document.querySelector("div.aeH"); // adjust for your layout
    if (inbox && sidebar) {
      clearInterval(interval);
      initInboxObserver();
      injectMailSensePanel();
      notifyBackground(); // initial fetch
    }
  }, 2000);
};

// Start
waitForInbox();
