// panel.js
const injectMailSensePanel = () => {
  if (document.getElementById("mailsense-panel")) return;

  const container = document.querySelector("div.aeH");
  if (!container) return;

  const panel = document.createElement("div");
  panel.id = "mailsense-panel";
  panel.style.border = "1px solid #ccc";
  panel.style.padding = "10px";
  panel.style.margin = "10px 0";
  panel.style.borderRadius = "8px";
  panel.style.backgroundColor = "#f5f5f5";
  panel.style.fontFamily = "Arial, sans-serif";

  const title = document.createElement("h3");
  title.textContent = "MailSense Categories";
  title.style.margin = "0 0 10px 0";
  panel.appendChild(title);

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

  container.prepend(panel);
};
