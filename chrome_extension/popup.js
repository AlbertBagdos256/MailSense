// Handle popup interactions
document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('statusText');
  
  // Get the active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  // Check if we're on Gmail and if an email is open
  if (currentTab.url.includes('mail.google.com')) {
    // Check if viewing an email (URL contains thread ID)
    if (currentTab.url.includes('/#inbox/') && currentTab.url.match(/\/[a-f0-9]+$/)) {
      statusText.innerHTML = 'Current Label: <strong>OTHER</strong>';
    } else {
      statusText.textContent = 'Open an email to apply label...';
    }
  } else {
    statusText.textContent = 'Open Gmail to use this extension.';
  }
});
