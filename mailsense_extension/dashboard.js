let dashboardActive = false;

// Toggle Dashboard View
export async function toggleDashboard() {
  const emailList = document.querySelector("table.F.cf.zt");
  const dashboardBtn = document.getElementById("stats-btn");
  
  if (!emailList) {
    console.error("Email list container not found");
    return;
  }

  dashboardActive = !dashboardActive;

  if (dashboardActive) {
    // Hide emails, show dashboard
    emailList.style.display = "none";
    if (dashboardBtn) {
      dashboardBtn.textContent = "📧 Show Emails";
      dashboardBtn.style.background = "linear-gradient(135deg, #fff5e5 0%, #ffe5bb 100%)";
      dashboardBtn.style.color = "#ff8c00";
    }
    
    // Create and inject dashboard
    await createDashboard(emailList.parentElement);
  } else {
    // Show emails, hide dashboard
    emailList.style.display = "";
    if (dashboardBtn) {
      dashboardBtn.textContent = "📊 Dashboard";
      dashboardBtn.style.background = "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)";
      dashboardBtn.style.color = "#0d6efd";
    }
    
    // Remove dashboard
    const dashboard = document.getElementById("mailsense-dashboard");
    if (dashboard) dashboard.remove();
  }
}

// Create Dashboard
async function createDashboard(container) {
  // Remove existing dashboard if any
  const existingDashboard = document.getElementById("mailsense-dashboard");
  if (existingDashboard) existingDashboard.remove();

  const data = await chrome.storage.local.get([
    'categorizedEmails',
    'spamResults',
    'categoryLabelMap'
  ]);

  const categorizedEmails = data.categorizedEmails || [];
  const spamResults = data.spamResults || [];
  const categoryLabelMap = data.categoryLabelMap || {};

  // Calculate stats
  const spamCount = spamResults.filter(s => s.label === 'spam').length;
  const totalEmails = categorizedEmails.length + spamCount;
  const categoryCount = Object.keys(categoryLabelMap).length;
  const spamRate = totalEmails > 0 ? ((spamCount / totalEmails) * 100).toFixed(1) : 0;

  // Count emails per category
  const categoryCounts = {};
  categorizedEmails.forEach(email => {
    categoryCounts[email.category] = (categoryCounts[email.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Create dashboard container
  const dashboard = document.createElement("div");
  dashboard.id = "mailsense-dashboard";
  dashboard.style.background = "#ffffff";
  dashboard.style.borderRadius = "1rem";
  dashboard.style.padding = "2rem";
  dashboard.style.marginTop = "1rem";
  dashboard.style.boxShadow = "0 0.25rem 1rem rgba(0, 0, 0, 0.08)";
  dashboard.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

  // Header
  const header = document.createElement("div");
  header.style.textAlign = "center";
  header.style.marginBottom = "2rem";
  header.innerHTML = `
    <h2 style="font-size: 2rem; color: #2c3e50; margin-bottom: 0.5rem; font-weight: 700;">
      📊 Email Analytics Dashboard
    </h2>
    <p style="color: #6c757d; font-size: 1rem;">Your email statistics at a glance</p>
  `;
  dashboard.appendChild(header);

  // Stats Grid
  const statsGrid = document.createElement("div");
  statsGrid.style.display = "grid";
  statsGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
  statsGrid.style.gap = "1.5rem";
  statsGrid.style.marginBottom = "2rem";

  const stats = [
    { label: "Total Emails", value: totalEmails, icon: "📨", color: "#667eea" },
    { label: "Spam Detected", value: spamCount, icon: "🛡️", color: "#ff6b6b" },
    { label: "Categories", value: categoryCount, icon: "🏷️", color: "#4facfe" },
    { label: "Spam Rate", value: spamRate + "%", icon: "📊", color: "#ffd93d" }
  ];

  stats.forEach(stat => {
    const card = document.createElement("div");
    card.style.background = `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}30 100%)`;
    card.style.padding = "1.5rem";
    card.style.borderRadius = "0.75rem";
    card.style.textAlign = "center";
    card.style.border = `2px solid ${stat.color}40`;
    card.style.transition = "transform 0.3s ease";
    card.style.cursor = "pointer";
    card.onmouseenter = () => card.style.transform = "translateY(-5px)";
    card.onmouseleave = () => card.style.transform = "translateY(0)";

    card.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${stat.icon}</div>
      <div style="font-size: 2rem; font-weight: 700; color: ${stat.color}; margin-bottom: 0.25rem;">
        ${stat.value}
      </div>
      <div style="color: #6c757d; font-size: 0.875rem; font-weight: 600;">
        ${stat.label}
      </div>
    `;
    statsGrid.appendChild(card);
  });

  dashboard.appendChild(statsGrid);

  // Chart Section
  if (sortedCategories.length > 0) {
    const chartSection = document.createElement("div");
    chartSection.style.marginTop = "2rem";
    chartSection.style.padding = "1.5rem";
    chartSection.style.background = "#f8f9fa";
    chartSection.style.borderRadius = "0.75rem";

    const chartTitle = document.createElement("h3");
    chartTitle.textContent = "📊 Top 10 Categories";
    chartTitle.style.fontSize = "1.5rem";
    chartTitle.style.color = "#2c3e50";
    chartTitle.style.marginBottom = "1.5rem";
    chartTitle.style.fontWeight = "600";
    chartSection.appendChild(chartTitle);

    // Create SVG chart
    const chartContainer = document.createElement("div");
    chartContainer.style.width = "100%";
    chartContainer.style.height = "400px";
    chartContainer.style.position = "relative";
    
    const svg = createBarChart(sortedCategories);
    chartContainer.appendChild(svg);
    chartSection.appendChild(chartContainer);

    dashboard.appendChild(chartSection);
  }

  // Spam Breakdown
  if (spamCount > 0) {
    const spamSection = document.createElement("div");
    spamSection.style.marginTop = "2rem";
    spamSection.style.padding = "1.5rem";
    spamSection.style.background = "linear-gradient(135deg, #ff6b6b15 0%, #ff6b6b30 100%)";
    spamSection.style.borderRadius = "0.75rem";
    spamSection.style.border = "2px solid #ff6b6b40";

    const spamTitle = document.createElement("h3");
    spamTitle.textContent = "🛡️ Spam Protection";
    spamTitle.style.fontSize = "1.25rem";
    spamTitle.style.color = "#ff6b6b";
    spamTitle.style.marginBottom = "0.5rem";
    spamTitle.style.fontWeight = "600";

    const spamText = document.createElement("p");
    spamText.style.color = "#2c3e50";
    spamText.style.fontSize = "1rem";
    spamText.style.lineHeight = "1.6";
    spamText.innerHTML = `
      We've protected you from <strong>${spamCount}</strong> spam emails, 
      keeping your inbox clean and organized. That's <strong>${spamRate}%</strong> 
      of all your emails!
    `;

    spamSection.appendChild(spamTitle);
    spamSection.appendChild(spamText);
    dashboard.appendChild(spamSection);
  }

  container.appendChild(dashboard);
}

// Create Bar Chart using SVG
function createBarChart(data) {
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 20, bottom: 80, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const colors = ["#667eea", "#764ba2", "#ff6b6b", "#ff9a56", "#ffd93d", "#6bcf7f", "#4facfe", "#00f2fe", "#43e97b", "#38f9d7"];

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

  // Background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", width);
  bg.setAttribute("height", height);
  bg.setAttribute("fill", "#ffffff");
  bg.setAttribute("rx", "8");
  svg.appendChild(bg);

  // Calculate scales
  const maxValue = Math.max(...data.map(d => d[1]));
  const barWidth = chartWidth / data.length;
  const xScale = (index) => padding.left + index * barWidth + barWidth * 0.1;
  const yScale = (value) => padding.top + chartHeight - (value / maxValue) * chartHeight;

  // Draw grid lines
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartHeight / gridLines) * i;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padding.left);
    line.setAttribute("y1", y);
    line.setAttribute("x2", width - padding.right);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#e9ecef");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);

    // Y-axis labels
    const value = Math.round(maxValue * (1 - i / gridLines));
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", padding.left - 10);
    text.setAttribute("y", y + 4);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("fill", "#6c757d");
    text.setAttribute("font-size", "12");
    text.textContent = value;
    svg.appendChild(text);
  }

  // Draw bars
  data.forEach(([category, count], index) => {
    const x = xScale(index);
    const y = yScale(count);
    const h = chartHeight - (y - padding.top);
    const w = barWidth * 0.8;

    // Bar
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", w);
    rect.setAttribute("height", h);
    rect.setAttribute("fill", colors[index % colors.length]);
    rect.setAttribute("rx", "4");
    rect.style.transition = "all 0.3s ease";
    rect.style.cursor = "pointer";

    // Hover effect
    rect.addEventListener("mouseenter", () => {
      rect.setAttribute("opacity", "0.8");
    });
    rect.addEventListener("mouseleave", () => {
      rect.setAttribute("opacity", "1");
    });

    svg.appendChild(rect);

    // Value label on top of bar
    const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueText.setAttribute("x", x + w / 2);
    valueText.setAttribute("y", y - 5);
    valueText.setAttribute("text-anchor", "middle");
    valueText.setAttribute("fill", "#2c3e50");
    valueText.setAttribute("font-size", "12");
    valueText.setAttribute("font-weight", "600");
    valueText.textContent = count;
    svg.appendChild(valueText);

    // X-axis label (category name)
    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.setAttribute("x", x + w / 2);
    labelText.setAttribute("y", height - padding.bottom + 20);
    labelText.setAttribute("text-anchor", "end");
    labelText.setAttribute("fill", "#2c3e50");
    labelText.setAttribute("font-size", "11");
    labelText.setAttribute("font-weight", "500");
    labelText.setAttribute("transform", `rotate(-45, ${x + w / 2}, ${height - padding.bottom + 20})`);
    
    // Truncate long labels
    const maxLength = 20;
    const truncated = category.length > maxLength ? category.substring(0, maxLength) + "..." : category;
    labelText.textContent = truncated;
    
    // Tooltip
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${category}: ${count} emails`;
    rect.appendChild(title);
    
    svg.appendChild(labelText);
  });

  // X-axis line
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", padding.left);
  xAxis.setAttribute("y1", padding.top + chartHeight);
  xAxis.setAttribute("x2", width - padding.right);
  xAxis.setAttribute("y2", padding.top + chartHeight);
  xAxis.setAttribute("stroke", "#2c3e50");
  xAxis.setAttribute("stroke-width", "2");
  svg.appendChild(xAxis);

  // Y-axis line
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", padding.left);
  yAxis.setAttribute("y1", padding.top);
  yAxis.setAttribute("x2", padding.left);
  yAxis.setAttribute("y2", padding.top + chartHeight);
  yAxis.setAttribute("stroke", "#2c3e50");
  yAxis.setAttribute("stroke-width", "2");
  svg.appendChild(yAxis);

  return svg;
}