// **** SET TO FALSE LATER TO USE REAL DATA ****
const USE_MOCK_DATA = true;

async function fetchAllEmails() {
    try {
        if (USE_MOCK_DATA) {
            console.log("Using mock data for testing...");
            return getMockEmails();
        }

        console.log("Fetching emails from backend...");
        const response = await fetch("http://localhost:8000/api/emails");

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Emails fetched successfully:", data);

        return transformBackendResponse(data);
    } catch (error) {
        console.error("Error fetching emails:", error);
        showError(`Failed to fetch emails: ${error.message}`);
        return [];
    }
}


function transformBackendResponse(data) {
    const emails = [];

    if (data.spam_results) {
        data.spam_results.forEach((result, index) => {
            emails.push({
                id: result.id || `spam_${index}`,
                subject: result.subject || "Unknown",
                body: result.body || "",
                category: result.label === "spam" ? "Spam" : "Uncategorized",
                date: new Date().toISOString().split("T")[0],
                spam_status: result.label
            });
        });
    }

    if (data.categorized_results) {
        data.categorized_results.forEach((result, index) => {
            emails.push({
                id: result.id || `cat_${index}`,
                subject: result.subject || "Unknown",
                body: result.body || "",
                category: result.category || "Uncategorized",
                date: new Date().toISOString().split("T")[0],
                spam_status: "not_spam"
            });
        });
    }

    return emails;
}


function transformEmailsForAnalytics(emails) {
    const categoryCount = {};
    const monthlyCount = {};
    let spamCount = 0;

    emails.forEach((email) => {
        const category = email.category || "Uncategorized";
        categoryCount[category] = (categoryCount[category] || 0) + 1;

        if (email.spam_status === "spam") {
            spamCount++;
        }

        const date = new Date(email.date);
        const month = date.toISOString().split("T")[0].substring(0, 7); // YYYY-MM
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

    const monthlyData = Object.entries(monthlyCount)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        categoryData,
        monthlyData,
        spamCount,
        totalEmails: emails.length,
        totalCategories: categoryData.length,
        dateRange: getDateRange(emails)
    };
}

/**
 * Get date range from emails
 */
function getDateRange(emails) {
    if (emails.length === 0) return "-";

    const dates = emails.map((e) => new Date(e.date)).sort((a, b) => a - b);
    const startDate = dates[0].toLocaleDateString();
    const endDate = dates[dates.length - 1].toLocaleDateString();

    return `${startDate} - ${endDate}`;
}


function showError(message) {
    const errorEl = document.getElementById("error-message");
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("visible");
    }
}

function clearError() {
    const errorEl = document.getElementById("error-message");
    if (errorEl) {
        errorEl.classList.remove("visible");
    }
}