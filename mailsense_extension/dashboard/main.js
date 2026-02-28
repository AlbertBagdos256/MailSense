async function initializeDashboard() {
    try {
        console.log("Initializing dashboard...");

        clearError();

        const data = await fetchAllEmails();
        const emails = data.emails || data;
        const externalSpamCount = data.spamCount || 0;

        if (emails.length === 0) {
            showError("No emails found");
            return;
        }

        console.log(`Loaded ${emails.length} emails`);

        const analytics = transformEmailsForAnalytics(emails);
        
        analytics.spamCount = analytics.spamCount || externalSpamCount;

        console.log("Analytics data:", analytics);

        updateStats(analytics);

        renderCategoryChart(analytics.categoryData, "#category-chart");
        renderMonthlyChart(analytics.monthlyData, "#monthly-chart");

        console.log("Dashboard initialized successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        showError(`Failed to initialize dashboard: ${error.message}`);
    }
}


function updateStats(analytics) {
    const totalEmailsEl = document.getElementById("total-emails");
    const totalCategoriesEl = document.getElementById("total-categories");
    const dateRangeEl = document.getElementById("date-range");
    const spamCountEl = document.getElementById("spam-count");

    if (totalEmailsEl) {
        totalEmailsEl.textContent = analytics.totalEmails;
    }

    if (totalCategoriesEl) {
        totalCategoriesEl.textContent = analytics.totalCategories;
    }

    if (dateRangeEl) {
        dateRangeEl.textContent = analytics.dateRange;
    }

    if (spamCountEl) {
        spamCountEl.textContent = analytics.spamCount;
    }

    console.log("Stats updated");
}


function handleRefresh() {
    console.log("Refreshing dashboard...");
    const refreshBtn = document.getElementById("refresh-btn");

    if (refreshBtn) {
        refreshBtn.classList.add("loading");
    }

    initializeDashboard().finally(() => {
        if (refreshBtn) {
            refreshBtn.classList.remove("loading");
        }
    });
}


function initializeEventListeners() {
    const refreshBtn = document.getElementById("refresh-btn");

    if (refreshBtn) {
        refreshBtn.addEventListener("click", handleRefresh);
    }

    console.log("Event listeners initialized");
}


document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing dashboard...");
    initializeEventListeners();
    initializeDashboard();
});