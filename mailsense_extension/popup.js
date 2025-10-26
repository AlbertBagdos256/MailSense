document.addEventListener("DOMContentLoaded", () => {
  const authorizeBtn = document.getElementById("authorize");
  const fetchBtn = document.getElementById("fetchEmails");

  authorizeBtn.addEventListener("click", () => {
    // First-time auth prompt
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Auth error:", chrome.runtime.lastError.message);
        alert("Authorization failed. Check console.");
        return;
      }
      console.log("Token acquired:", token);
      alert("Gmail authorized successfully!");
    });
  });

  fetchBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "fetchEmails" });
  });
});
