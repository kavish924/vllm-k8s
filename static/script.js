// =========================================
// LLM Studio — Frontend Logic
// =========================================

const API_BASE = window.location.origin;
const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const chatArea = document.getElementById('chat-area');
const welcomeScreen = document.getElementById('welcome-screen');
const messagesContainer = document.getElementById('messages-container');
const statusIndicator = document.getElementById('status-indicator');

// --- Health Check ---
async function checkHealth() {
    const statusText = statusIndicator.querySelector('.status-text');
    try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data.status === 'ok') {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Online';
        } else {
            throw new Error('Unhealthy');
        }
    } catch {
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Offline';
    }
}

checkHealth();
setInterval(checkHealth, 30000);

// --- Helpers ---
function getTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
}

// --- Message Rendering ---
function addMessage(type, text) {
    // Hide welcome screen on first message
    if (welcomeScreen && welcomeScreen.parentNode) {
        welcomeScreen.style.display = 'none';
    }

    const msg = document.createElement('div');
    msg.className = `message ${type}`;

    const avatarLabel = type === 'user' ? 'U' : type === 'ai' ? 'AI' : '!';
    const nameLabel = type === 'user' ? 'You' : type === 'ai' ? 'LLM Studio' : 'Error';

    let copyBtnHtml = '';
    if (type === 'ai') {
        copyBtnHtml = `<button class="copy-btn" title="Copy response" onclick="copyText(this)">📋</button>`;
    }

    msg.innerHTML = `
        <div class="message-avatar">${avatarLabel}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">${nameLabel}</span>
                <span class="message-time">${getTime()}</span>
            </div>
            <div class="message-bubble">
                ${escapeHtml(text)}
                ${copyBtnHtml}
            </div>
        </div>
    `;

    messagesContainer.appendChild(msg);
    scrollToBottom();
    return msg;
}

function addTypingIndicator() {
    const msg = document.createElement('div');
    msg.className = 'message ai';
    msg.id = 'typing-msg';
    msg.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">LLM Studio</span>
                <span class="message-time">${getTime()}</span>
            </div>
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(msg);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-msg');
    if (el) el.remove();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Copy to clipboard ---
window.copyText = function(btn) {
    const bubble = btn.closest('.message-bubble');
    // Get text without the button text
    const clone = bubble.cloneNode(true);
    const copyBtn = clone.querySelector('.copy-btn');
    if (copyBtn) copyBtn.remove();
    const text = clone.textContent.trim();

    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = '📋';
            btn.classList.remove('copied');
        }, 2000);
    });
};

// --- Generate Text ---
async function generate(prompt) {
    if (!prompt.trim()) return;

    addMessage('user', prompt);
    promptInput.value = '';
    promptInput.style.height = 'auto';
    sendBtn.disabled = true;

    addTypingIndicator();

    try {
        const res = await fetch(`${API_BASE}/generate?prompt=${encodeURIComponent(prompt)}`);
        removeTypingIndicator();

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        addMessage('ai', data.response);
    } catch (err) {
        removeTypingIndicator();
        addMessage('error', `Failed to generate: ${err.message}. Make sure the API server is running.`);
    } finally {
        sendBtn.disabled = false;
        promptInput.focus();
    }
}

// --- Event Listeners ---
sendBtn.addEventListener('click', () => generate(promptInput.value));

promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generate(promptInput.value);
    }
});

// Auto-resize textarea
promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
});

// Suggestion chips
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        promptInput.value = prompt;
        generate(prompt);
    });
});
