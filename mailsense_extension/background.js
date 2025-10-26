/**
 * MailSense Chrome Extension - background.js
 * ------------------------------------------
 * Handles Gmail API authentication, fetching emails, and sending them to FastAPI backend.
 * 
 * Key responsibilities:
 * 1. Obtain OAuth token via Chrome Identity API
 * 2. Fetch list of Gmail messages (IDs)
 * 3. Fetch full email details (subject + snippet)
 * 4. Send emails to backend
 * 
 * Input: message.action === "fetchEmails" (from popup.js or content script)
 * Output: emails sent to backend via POST request
*/

// Token Authentication
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    // Request OAuth token interactively
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) { 
        // Reject if failed
        reject("No token found");
      } else {
        resolve(token);
      }
    });
  });
}

// getting IDs of last 100 emails
async function fetchMessageList(token) {
  // Call Gmail API to get list of message IDs
  const resp = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    { headers: { Authorization: `Bearer ${token}` } } // Send OAuth token
  );
  const data = await resp.json(); // Parse JSON response
  return data.messages || []; // Return messages array or empty array
}

// exracting emails content by their IDs
async function fetchFullMessage(token, id) {
  // Call Gmail API to get full message data
  const resp = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const msgData = await resp.json(); // Parse JSON

  // Extract subject from headers
  const headers = msgData.payload.headers;
  const subject = headers.find(h => h.name === "Subject")?.value || "(no subject)";
  const body = msgData.snippet || ""; // Use snippet as body

  return { id, subject, body }; // Return simplified email object
}


async function sendToBackend(emails) {
  // Send POST request with emails array to backend
  await fetch("http://127.0.0.1:8000/api/emails", {
    method: "POST", // POST request
    headers: { "Content-Type": "application/json" }, // JSON content type
    body: JSON.stringify(emails), // Convert array to JSON string
  });
}

// multi threading optimization
async function fetchWithConcurrency(list, fn, limit = 10) {
  const results = [];
  for (let i = 0; i < list.length; i += limit) {
    const chunk = list.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

// Listen for messages from popup.js or content scripts
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "fetchEmails") { // Only handle "fetchEmails" action
    try {
      // Get OAuth token from Chrome Identity API
      const token = await getAuthToken();

      // Fetch list of Gmail message IDs
      const messageList = await fetchMessageList(token);

      // Array to store full email details
      const emailsToSend = await fetchWithConcurrency(messageList, msg => fetchFullMessage(token, msg.id));

      // Send collected emails to FastAPI backend
      await sendToBackend(emailsToSend);

      console.log(`Sent ${emailsToSend.length} emails to backend.`); // Log success
    } catch (err) {
      console.error("Error fetching or sending emails:", err); // Log any errors
    }
  }
});