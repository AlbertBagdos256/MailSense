// Background script for Gmail Auto-Labeler
// This script runs in the background and handles extension events

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Gmail Auto-Labeler extension installed');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'labelApplied') {
    console.log(`Label applied to email: ${request.emailId}`);
  }
  return true; // Required for async sendResponse
});
