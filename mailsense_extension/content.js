function insertMailSenseButton() {
  const observer = new MutationObserver(() => {
    const toolbar = document.querySelector("div[gh='mtb']");
    if (toolbar && !document.getElementById("mailsense-btn")) {
      const btn = document.createElement("button");
      btn.id = "mailsense-btn";
      btn.textContent = "Fetch MailSense";
      btn.style.marginLeft = "10px";

      btn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "fetchEmails" });
      });

      toolbar.appendChild(btn);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

insertMailSenseButton();
