/**
 * panel.js
 * ----------------------------------------
 * Injects MailSense panel and filters Gmail inbox
 * based on labels stored in chrome.storage.local.
 */

const injectMailSensePanel = async () => {
  if (document.getElementById("mailsense-panel")) return;

  const container = document.querySelector("div.aeH");
  if (!container) return;

  // --- Panel setup
  const panel = document.createElement("div");
  panel.id = "mailsense-panel";
  panel.style.border = "0.0625em solid #e0e0e0";
  panel.style.padding = "0.875em";
  panel.style.margin = "0.625em 0";
  panel.style.borderRadius = "0.5em";
  panel.style.background = "#ffffff";
  panel.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  panel.style.boxShadow = "0 0.125em 0.5em rgba(0, 0, 0, 0.1), 0 0.25em 0.75em rgba(0, 0, 0, 0.08)";

  const title = document.createElement("h3");
  title.textContent = "MailSense Filter";
  title.style.margin = "0 0 0.5em 0";
  title.style.fontSize = "1em";
  title.style.fontWeight = "600";
  title.style.color = "#333";
  panel.appendChild(title);

  // Category configuration with icons and gradient colors
  const categories = [
    {
      name: "All",
      icon: "📋",
      gradient: "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)",
      hoverGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
    },
    {
      name: "Work",
      icon: "💼",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
      hoverGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    {
      name: "Education",
      icon: "🎓",
      gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
      hoverGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
    },
    {
      name: "Internships",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
      hoverGradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
    },
    {
      name: "Needs-Replying",
      icon: "✉️",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      hoverGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    {
      name: "Personal",
      icon: "👤",
      gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
      hoverGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
    },
    {
      name: "Spam / Advertisement",
      icon: "🚫",
      gradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
      hoverGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      name: "Other",
      icon: "📁",
      gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
      hoverGradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)"
    }
  ];

  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.flexWrap = "wrap";
  btnContainer.style.gap = "0.375em";

  categories.forEach(cat => {
    const btn = document.createElement("button");

    // Create icon span
    const iconSpan = document.createElement("span");
    iconSpan.textContent = cat.icon + " ";
    iconSpan.style.marginRight = "0.25em";

    // Create text span
    const textSpan = document.createElement("span");
    textSpan.textContent = cat.name;

    btn.appendChild(iconSpan);
    btn.appendChild(textSpan);

    btn.style.margin = "0";
    btn.style.padding = "0.5em 0.875em";
    btn.style.border = "none";
    btn.style.borderRadius = "0.375em";
    btn.style.background = cat.gradient;
    btn.style.color = "#ffffff";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "0.875em";
    btn.style.fontWeight = "500";
    btn.style.transition = "all 0.2s ease";
    btn.style.boxShadow = "0 0.125em 0.25em rgba(0, 0, 0, 0.1)";

    // Hover effect
    btn.addEventListener("mouseenter", () => {
      btn.style.background = cat.hoverGradient;
      btn.style.transform = "translateY(-0.0625em)";
      btn.style.boxShadow = "0 0.25em 0.5em rgba(0, 0, 0, 0.15)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.background = cat.gradient;
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "0 0.125em 0.25em rgba(0, 0, 0, 0.1)";
    });

    btn.onclick = () => {
      console.log("Button clicked:", cat.name);
      filterGmailByCategory(cat.name);
    };

    btnContainer.appendChild(btn);
  });

  panel.appendChild(btnContainer);
  container.prepend(panel);
};

/*Filter Gmail threads by category*/
async function filterGmailByCategory(category) {
  const rows = document.querySelectorAll("tr.zA");
  if (!rows.length) {
    console.warn("No Gmail rows found — inbox may not be fully loaded yet.");
    return;
  }

  const stored = await chrome.storage.local.get("labeledEmails");
  const labeledEmails = stored.labeledEmails || [];

  console.log("Loaded labeled emails:", labeledEmails.slice(0, 5));
  console.log("Filtering category:", category);

  if (category === "All") {
    rows.forEach(row => (row.style.display = ""));
    return;
  }

  // Map category names to label keys used in storage
  const categoryMap = {
    "Work": "work",
    "Education": "education",
    "Internships": "internships",
    "Needs-Replying": "needs-replying",
    "Personal": "personal",
    "Spam / Advertisement": "spam",
    "Other": "other"
  };

  const labelKey = categoryMap[category] || category.toLowerCase().replace(/\s+/g, "-");

  let matchedCount = 0;

  rows.forEach(row => {
    const span = row.querySelector("span[data-legacy-thread-id]");
    const threadId = span?.getAttribute("data-legacy-thread-id"); // ← this is the ID used in storage

    if (!threadId) {
      // fallback if something goes wrong
      row.style.display = "";
      return;
    }

    const match = labeledEmails.find(e => e.id === threadId);

    if (match?.label === labelKey) {
      row.style.display = ""; // show
    } else {
      row.style.display = "none"; // hide
    }
  });


  console.log(`Filtered ${matchedCount} emails for category: ${category}`);
}


/*Initialize the panel when Gmail loads*/
const observer = new MutationObserver(() => {
  const inboxLoaded = document.querySelector("div.aeH tr.zA");
  if (inboxLoaded) {
    injectMailSensePanel();
    observer.disconnect();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
