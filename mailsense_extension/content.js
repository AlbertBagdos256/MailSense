// -------------------------------------------------------
// Observes Gmail DOM and injects MailSense panel with categories

let inboxObserverInitialized = false;
let initialFetchDone = false;

// Function to notify background to fetch emails
const notifyBackground = () => {
  if (chrome.runtime && chrome.runtime.id) {
    if (initialFetchDone) return; // prevent multiple initial fetches

    chrome.runtime.sendMessage({ action: "fetchEmails" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Message failed:", chrome.runtime.lastError.message);
      } else {
        console.log("Notified background to fetch emails...");
        initialFetchDone = true; // mark that initial fetch was done
      }
    });
  } else {
    console.warn("Extension context not valid yet");
  }
};

// Initialize observer for Gmail inbox
const initInboxObserver = () => {
  if (inboxObserverInitialized) return; // only initialize once
  const inbox = document.querySelector("div[role='main']");
  if (!inbox) return;

  const observer = new MutationObserver(() => {
    // We can optionally throttle/debounce this later if needed
    console.log("Inbox DOM mutated, notifying background...");
    notifyBackground();
  });

  observer.observe(inbox, { childList: true, subtree: true });
  inboxObserverInitialized = true;
  console.log("Inbox observer initialized.");
};

// Wait until Gmail inbox is ready
const waitForInbox = () => {
  const interval = setInterval(() => {
    const inbox = document.querySelector("div[role='main']");
    const sidebar = document.querySelector("div.aeH");
    if (inbox && sidebar) {
      clearInterval(interval);

      injectMailSensePanel(); // your function to inject UI
      initInboxObserver();    // start observing DOM
      notifyBackground();     // initial fetch once
    }
  }, 1000); // poll every 1s
};

waitForInbox();
