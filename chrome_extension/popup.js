// Handle popup interactions
document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('statusText');
  
  // Get the active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  console.log('Current URL:', currentTab.url);
  
  // Check if we're on Gmail and if an email is open
  if (currentTab.url.includes('mail.google.com')) {
    // Check if viewing an email - Gmail URLs have a thread ID after the last /
    // Example: https://mail.google.com/mail/u/0/#inbox/FMfcgzGwkXvWqLkDqXvZlqWkCmNvGbpT
    const hasThreadId = /\/[a-zA-Z0-9]+$/.test(currentTab.url);
    
    if (hasThreadId) {
      statusText.innerHTML = 'Current Label: <strong>OTHER</strong>';
    } else {
      statusText.textContent = 'Open an email to apply label...';
    }
  } else {
    statusText.textContent = 'Open Gmail to use this extension.';
  }
});
