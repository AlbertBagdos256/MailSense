const IS_EXTENSION = typeof chrome !== 'undefined' && chrome.storage;

async function fetchAllEmails() {
    try {
        if (!IS_EXTENSION) {
            throw new Error("Dashboard must be run as a Chrome extension to access email data");
        }

        console.log("Fetching emails from extension storage...");
        const data = await new Promise(resolve => {
            chrome.storage.local.get(['categorizedEmails', 'spamResults'], resolve);
        });
        
        if (!data.categorizedEmails || !data.spamResults) {
            throw new Error("No email data found in extension storage. Please use the extension to fetch emails first.");
        }
        
        console.log("Emails loaded from extension storage");
        return transformExtensionData(data);
    } catch (error) {
        console.error("Error fetching emails:", error);
        showError(`Failed to fetch emails: ${error.message}`);
        return [];
    }
}


function transformExtensionData(data) {
    const emails = [];
    const processedIds = new Set();
    let spamCount = 0;
    
    console.log("Processing categorized emails:", data.categorizedEmails);
    console.log("Processing spam results:", data.spamResults);
    
    if (data.categorizedEmails) {
        Object.entries(data.categorizedEmails).forEach(([id, categoryData]) => {
            const category = (categoryData && typeof categoryData === 'object')
                ? (categoryData.category || categoryData.label)
                : (typeof categoryData === 'string' ? categoryData : null);

            if (!category) {
                console.log(`Skipping email ${id} - no valid category found`);
                return;
            }

            const spamResult = data.spamResults?.[id];
            let emailDate;
            
            if (spamResult?.date) {
                emailDate = spamResult.date;
            } else if (spamResult?.internalDate) {
                emailDate = new Date(parseInt(spamResult.internalDate)).toISOString().split("T")[0];
            } else {
                emailDate = new Date().toISOString().split("T")[0];
            }

            emails.push({
                id: id,
                subject: spamResult?.subject || `Email ${id.substring(0, 8)}...`,
                body: spamResult?.body || "Email content not available",
                category: category,
                date: emailDate,
                spam_status: "not_spam"
            });
            processedIds.add(id);
        });
    }
    
    if (data.spamResults) {
        Object.entries(data.spamResults).forEach(([id, result]) => {
            if (result.label === "spam") {
                spamCount++;
                let emailDate;
                if (result.date) {
                    emailDate = result.date;
                } else if (result.internalDate) {
                    emailDate = new Date(parseInt(result.internalDate)).toISOString().split("T")[0];
                } else {
                    emailDate = new Date().toISOString().split("T")[0];
                }
                
                emails.push({
                    id: id,
                    subject: result.subject || "No subject",
                    body: result.body || "",
                    category: "Spam",
                    date: emailDate,
                    spam_status: "spam"
                });
                console.log(`Added spam email ${id} to chart`);
                return;
            }
            
            if (!processedIds.has(id)) {
                if (!result.category || result.category === "not_spam") {
                    console.log(`Skipping email ${id} - no valid category found`);
                    return;
                }
                
                let emailDate;
                if (result.date) {
                    emailDate = result.date;
                } else if (result.internalDate) {
                    emailDate = new Date(parseInt(result.internalDate)).toISOString().split("T")[0];
                } else {
                    emailDate = new Date().toISOString().split("T")[0];
                }
                
                emails.push({
                    id: id,
                    subject: result.subject || "No subject",
                    body: result.body || "",
                    category: result.category,
                    date: emailDate,
                    spam_status: "not_spam"
                });
            }
        });
    }
    
    console.log(`Processed ${emails.length} categorized emails and ${spamCount} spam emails`);
    if (emails.length > 0) {
        const dates = emails.map(e => e.date).sort();
        console.log("Date range:", dates[0], "to", dates[dates.length - 1]);
    }
    return { emails, spamCount };
}


function transformEmailsForAnalytics(emails) {
    const categoryCount = {};
    const monthlyCount = {};
    let spamCount = 0;

    emails.forEach((email) => {
        if (email.category) {
            categoryCount[email.category] = (categoryCount[email.category] || 0) + 1;
        }

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