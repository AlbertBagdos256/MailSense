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
  panel.style.border = "none";
  panel.style.padding = "1rem";
  panel.style.margin = "0.75rem 0";
  panel.style.borderRadius = "1rem";
  panel.style.background = "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)";
  panel.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  panel.style.boxShadow = "0 0.25rem 1rem rgba(0, 0, 0, 0.08)";

  const title = document.createElement("h3");
  title.textContent = "📧 MailSense Filters";
  title.style.margin = "0 0 0.75rem 0";
  title.style.fontSize = "1.125rem";
  title.style.fontSize = "1.25rem";
  title.style.fontWeight = "600";
  title.style.color = "#2c3e50";
  title.style.letterSpacing = "0.02rem";
  panel.appendChild(title);

  /* --- SPAM BUTTON --- */
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "0.5rem";
  buttonContainer.style.marginBottom = "0.5rem";

  const spamBtn = document.createElement("button");
  spamBtn.id = "spam-toggle-btn";
  spamBtn.textContent = "🛡️ Show Spam";
  styleSpamButton(spamBtn);
  spamBtn.onclick = async () => toggleSpamFilter(spamBtn);
  buttonContainer.appendChild(spamBtn);

  /* --- STATS BUTTON --- */
  const statsBtn = document.createElement("button");
  statsBtn.id = "stats-btn";
  statsBtn.textContent = "📊 Stats";
  styleSpamButton(statsBtn);
  statsBtn.onclick = () => {
    // Send message to background script to open dashboard
    chrome.runtime.sendMessage({
      action: "openDashboard"
    });
  };
  buttonContainer.appendChild(statsBtn);

  panel.appendChild(buttonContainer);

  /* --- CATEGORY SECTION --- */
  const catLabel = document.createElement("h4");
  catLabel.textContent = "Categories";
  catLabel.style.margin = "1rem 0 0.5rem 0";
  catLabel.style.fontSize = "0.813rem";
  catLabel.style.fontWeight = "600";
  catLabel.style.color = "#6c757d";
  catLabel.style.textTransform = "uppercase";
  catLabel.style.letterSpacing = "0.05rem";
  panel.appendChild(catLabel);

  const catContainer = document.createElement("div");
  catContainer.style.display = "flex";
  catContainer.style.flexWrap = "wrap";
  catContainer.style.gap = "0.5rem";
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

  const gradients = [
    "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)", // red
    "linear-gradient(135deg, #ff9a56 0%, #ff7b54 100%)", // orange
    "linear-gradient(135deg, #ffd93d 0%, #ffc93c 100%)", // yellow
    "linear-gradient(135deg, #6bcf7f 0%, #4db8ac 100%)", // green
    "linear-gradient(135deg, #6a9cff 0%, #5f7de8 100%)"  // blue
  ];

  container.innerHTML = "";

  categories.forEach((category, index) => {
    const btn = document.createElement("button");
    btn.textContent = category;

    // Assign gradient colors cycling through the array
    const gradientIndex = index % gradients.length;
    styleCategoryButton(btn, gradients[gradientIndex]);

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
    button.textContent = "📧 Show All";
    applySpamFilter(spamResults);
  } else {
    button.textContent = "🛡️ Show Spam";
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

function styleSpamButton(btn) {
  btn.style.flex = "1";
  btn.style.padding = "0.625rem 1rem";
  btn.style.border = "none";
  btn.style.borderRadius = "0.5rem";
  btn.style.background = "linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)";
  btn.style.color = "#dc3545";
  btn.style.fontSize = "0.875rem";
  btn.style.fontWeight = "600";
  btn.style.cursor = "pointer";
  btn.style.transition = "all 0.3s ease";
  btn.style.boxShadow = "0 0.125rem 0.5rem rgba(220, 53, 69, 0.15)";

  btn.onmouseenter = () => {
    btn.style.transform = "translateY(-0.125rem)";
    btn.style.boxShadow = "0 0.25rem 0.75rem rgba(220, 53, 69, 0.25)";
  };

  btn.onmouseleave = () => {
    btn.style.transform = "translateY(0)";
    btn.style.boxShadow = "0 0.125rem 0.5rem rgba(220, 53, 69, 0.15)";
  };
}

function styleCategoryButton(btn, gradient) {
  btn.style.padding = "0.5rem 1rem";
  btn.style.border = "none";
  btn.style.borderRadius = "0.5rem";
  btn.style.background = gradient;
  btn.style.color = "#ffffff";
  btn.style.fontSize = "0.813rem";
  btn.style.fontWeight = "600";
  btn.style.cursor = "pointer";
  btn.style.transition = "all 0.3s ease";
  btn.style.boxShadow = "0 0.125rem 0.375rem rgba(0, 0, 0, 0.15)";
  btn.style.textShadow = "0 0.063rem 0.125rem rgba(0, 0, 0, 0.2)";

  btn.onmouseenter = () => {
    btn.style.transform = "translateY(-0.125rem) scale(1.05)";
    btn.style.boxShadow = "0 0.25rem 0.75rem rgba(0, 0, 0, 0.25)";
  };

  btn.onmouseleave = () => {
    btn.style.transform = "translateY(0) scale(1)";
    btn.style.boxShadow = "0 0.125rem 0.375rem rgba(0, 0, 0, 0.15)";
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