// DOM Elements
let authorizeBtn, statusBadge, statusDot, statusText;
let categoryCountEl, processedCountEl;
let categoriesList, loadingOverlay, settingsBtn;

// State
let isAuthorized = false;
let isLoading = false;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  setupEventListeners();
  loadInitialData();
  checkAuthStatus();
});

function initializeElements() {
  authorizeBtn = document.getElementById("authorize");
  statusBadge = document.getElementById("statusBadge");
  statusDot = statusBadge?.querySelector(".status-dot");
  statusText = statusBadge?.querySelector(".status-text");
  categoryCountEl = document.getElementById("categoryCount");
  processedCountEl = document.getElementById("processedCount");
  categoriesList = document.getElementById("categoriesList");
  loadingOverlay = document.getElementById("loadingOverlay");
  settingsBtn = document.getElementById("settingsBtn");
}

function setupEventListeners() {
  authorizeBtn?.addEventListener("click", handleAuthorize);
  settingsBtn?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Listen for storage changes to update UI
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.spamResults || changes.categorizedEmails) {
      updateStats();
      updateCategories();
    }
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "loading") {
      setLoading(message.loading);
    } else if (message.action === "authStatus") {
      updateAuthStatus(message.authorized);
    }
  });
}

async function checkAuthStatus() {
  try {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      const authorized = !chrome.runtime.lastError && !!token;
      updateAuthStatus(authorized);
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    updateAuthStatus(false);
  }
}

async function loadInitialData() {
  await updateStats();
  await updateCategories();
}

async function updateStats() {
  try {
    const stored = await chrome.storage.local.get(["spamResults", "categorizedEmails"]);
    const spamResults = stored.spamResults || [];
    const categorizedEmails = stored.categorizedEmails || [];

    // Count unique categories
    const uniqueCategories = new Set(categorizedEmails.map(e => e.category));
    const totalProcessed = spamResults.length + categorizedEmails.length;

    if (categoryCountEl) categoryCountEl.textContent = uniqueCategories.size;
    if (processedCountEl) processedCountEl.textContent = totalProcessed;
  } catch (error) {
    console.error("Error updating stats:", error);
  }
}

async function updateCategories() {
  try {
    const stored = await chrome.storage.local.get("categorizedEmails");
    const categorizedEmails = stored.categorizedEmails || [];

    if (!categoriesList) return;

    if (categorizedEmails.length === 0) {
      categoriesList.innerHTML = '<div class="empty-state">No categories yet. Emails are processed automatically!</div>';
      return;
    }

    // Group by category
    const categoryGroups = {};
    categorizedEmails.forEach(email => {
      const cat = email.category || "Uncategorized";
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = [];
      }
      categoryGroups[cat].push(email);
    });

    // Create category items - SHOW ALL instead of top 5
    const categoriesHTML = Object.entries(categoryGroups)
      .sort((a, b) => b[1].length - a[1].length)
      // Removed .slice(0, 5) to show all categories
      .map(([category, emails]) => `
        <div class="category-item" data-category="${category}">
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-count">${emails.length}</span>
        </div>
      `).join("");

    categoriesList.innerHTML = categoriesHTML;

    // Add click handlers
    categoriesList.querySelectorAll(".category-item").forEach(item => {
      item.addEventListener("click", () => {
        const category = item.dataset.category;
        const labelQuery = category.replace(/\s+/g, "+");
        chrome.tabs.create({
          url: `https://mail.google.com/mail/u/0/#label/${encodeURIComponent(category)}`
        });
      });
    });
  } catch (error) {
    console.error("Error updating categories:", error);
  }
}

function updateAuthStatus(authorized) {
  isAuthorized = authorized;

  if (authorized) {
    statusText.textContent = "Connected";
    statusDot.className = "status-dot";
    authorizeBtn.textContent = "Re-authorize";
  } else {
    statusText.textContent = "Not Connected";
    statusDot.className = "status-dot error";
    authorizeBtn.textContent = "Authorize Gmail";
  }
}

async function handleAuthorize() {
  setLoading(true);

  try {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      setLoading(false);

      if (chrome.runtime.lastError || !token) {
        console.error("Auth error:", chrome.runtime.lastError?.message);
        updateAuthStatus(false);
        showNotification("Authorization failed. Please try again.", "error");
        return;
      }

      console.log("Token acquired:", token);
      updateAuthStatus(true);
      showNotification("Gmail authorized successfully! 🎉", "success");
    });
  } catch (error) {
    setLoading(false);
    console.error("Authorization error:", error);
    showNotification("An error occurred during authorization.", "error");
  }
}

function setLoading(loading) {
  isLoading = loading;

  if (loadingOverlay) {
    if (loading) {
      loadingOverlay.classList.add("active");
    } else {
      loadingOverlay.classList.remove("active");
    }
  }

  if (authorizeBtn) authorizeBtn.disabled = loading;
}

function showNotification(message, type = "info") {
  // Create a simple toast notification
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
    background: ${type === "error" ? "#EA4335" : type === "success" ? "#34A853" : "#4285F4"};
    color: white;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 500;
    box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add toast animations to head
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
