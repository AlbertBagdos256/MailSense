// content.js
// -------------------------------------------------------
// Observes Gmail DOM and injects MailSense panel with categories


// Function to notify background to fetch emails
const notifyBackground = () => {
  try {
    chrome.runtime.sendMessage({ action: "fetchEmails" });
    console.log("Notified background to fetch emails...");
  } catch (err) {
    console.warn("Could not send message (context invalidated)", err);
  }
};

// Initialize observer for Gmail inbox
const initInboxObserver = () => {
  const inbox = document.querySelector("div[role='main']");
  if (!inbox) return;

  const observer = new MutationObserver(() => {
    try {
      notifyBackground(); // safe call
    } catch {}
  });

  observer.observe(inbox, { childList: true, subtree: true });
  console.log("Inbox observer initialized.");
};


const waitForInbox = () => {
  const interval = setInterval(() => {
    const inbox = document.querySelector("div[role='main']");
    const sidebar = document.querySelector("div.aeH");
    if (inbox && sidebar) {
      injectMailSensePanel();
      clearInterval(interval);
      initInboxObserver();
      notifyBackground();    // initial fetch
    }
  }, 1000);
};

waitForInbox();


