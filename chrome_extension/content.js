// Hardcoded label for now
const HARDCODED_LABEL = 'OTHER';

// Function to check if we're on a Gmail email page
function isEmailPage() {
    return window.location.href.includes('mail.google.com/mail/u/') && 
           window.location.href.includes('/#inbox/');
}

// Function to apply the label
function applyLabel() {
    if (!isEmailPage()) return;
    
    // Wait for Gmail's UI to be ready
    const checkForGmail = setInterval(() => {
        const moreButton = document.querySelector('[data-tooltip="More"]');
        if (moreButton) {
            clearInterval(checkForGmail);
            
            // Click the More button
            moreButton.click();
            
            // Wait for the dropdown to appear and click 'Label as'
            setTimeout(() => {
                const labelButtons = Array.from(document.querySelectorAll('.J-N-JX'));
                const labelButton = labelButtons.find(el => el.textContent.includes('Label as'));
                
                if (labelButton) {
                    labelButton.click();
                    
                    // Wait for the label dropdown to appear
                    setTimeout(() => {
                        const labelInput = document.querySelector('input[type="text"]');
                        if (labelInput) {
                            // Enter the hardcoded label
                            labelInput.value = HARDCODED_LABEL;
                            
                            // Trigger input event to make Gmail react
                            const event = new Event('input', { bubbles: true });
                            labelInput.dispatchEvent(event);
                            
                            // Press Enter to apply the label
                            setTimeout(() => {
                                const enterEvent = new KeyboardEvent('keydown', {
                                    key: 'Enter',
                                    code: 'Enter',
                                    keyCode: 13,
                                    which: 13,
                                    bubbles: true
                                });
                                labelInput.dispatchEvent(enterEvent);
                            }, 500);
                        }
                    }, 500);
                }
            }, 500);
        }
    }, 1000);
}

// Run the function when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLabel);
} else {
    applyLabel();
}

// Also run when navigating between emails in Gmail's single-page app
let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        if (isEmailPage()) {
            setTimeout(applyLabel, 1000); // Wait for the email to load
        }
    }
}).observe(document, { subtree: true, childList: true });
