(function () {
    const API_BASE = 'https://renew-bot-backend-prod-v3.up.railway.app';
    const API_URL = API_BASE + '/chat/stream';

    const getOrCreateDeviceId = () => {
        const STORAGE_KEY = 'renew_chat_device_id';
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return stored;
        } catch {}
        const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
        const id = 'web-' + hex() + hex();
        try { localStorage.setItem(STORAGE_KEY, id); } catch {}
        return id;
    };

    const deviceId = getOrCreateDeviceId();

    const loadStylesheet = (url) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    };

    // Load required styles
    loadStylesheet('https://renewchatbot2.vercel.app/styles.css');

    (function initChat() {

            // Create a shadow DOM container
            const container = document.createElement('div');
            container.id = 'renew-chat-container';
            document.body.appendChild(container);

            // Create shadow root
            const shadowRoot = container.attachShadow({ mode: 'open' });

            // Create style element for your component styles
            const style = document.createElement('style');
            style.textContent = `
                :host {
                    all: initial;
                    display: block;
                }

                .chat-button {
                    position: fixed;
                    bottom: 1.25rem;
                    right: 1.25rem;
                    height: 3rem;
                    min-height: 3rem;
                    padding: 0 1.5rem;
                    border-radius: 1.5rem;
                    background-color: #d7ba5a;
                    color: #000;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    z-index: 999999;
                    transition: all 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    will-change: transform;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .chat-button:hover {
                    background-color: #c5a84d;
                    transform: scale(1.02) translateZ(0);
                }

                .chat-button:active {
                    transform: scale(0.98) translateZ(0);
                }

                @media (max-width: 767px) {
                    .chat-button {
                        bottom: 1rem;
                        right: 1rem;
                        padding: 0 1.25rem;
                        height: 2.75rem;
                        min-height: 2.75rem;
                        font-size: 0.875rem;
                    }
                }
                
                .chat-container {
                    position: fixed;
                    bottom: 5rem;
                    right: 1.25rem;
                    width: 300px;
                    height: 500px;
                    max-height: calc(100vh - 180px);
                    border: none;
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 999998;
                    display: none;
                    background: white;
                    overflow: hidden;
                    margin-right: 2.5rem;
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    flex-direction: column;
                    overscroll-behavior: contain;
                    transition: bottom 0.3s ease;
                }

                @media (max-width: 767px) {
                    .chat-container {
                        width: calc(100% - 2.5rem);
                        height: calc(100vh - 180px);
                        max-height: none;
                        right: 1rem;
                        bottom: 4rem;
                        margin-right: 0;
                    }

                    .chat-container.keyboard-open {
                        height: calc(100vh - 360px);
                        bottom: 0;
                    }

                    .chat-button {
                        bottom: 1rem;
                        right: 1rem;
                        padding: 0 1.25rem;
                        height: 2.75rem;
                        min-height: 2.75rem;
                        font-size: 0.875rem;
                    }

                    .chat-button.hidden {
                        display: none;
                    }
                }

                .chat-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    flex-shrink: 0;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 1rem;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    overscroll-behavior: contain;
                    -ms-overflow-style: none;
                    scrollbar-width: thin;
                }

                .message {
                    max-width: 75%;
                    padding: 0.5rem 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    color: white;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                }

                .message a {
                    color: inherit;
                    text-decoration: underline;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }

                .message a:hover {
                    opacity: 0.8;
                }

                .message.user {
                    margin-left: auto;
                    background-color: #d7ba5a;
                }

                .message.bot {
                    background-color: #2c2c2c;
                }

                .message.bot a {
                    color: #d7ba5a;
                }

                .chat-input {
                    position: relative;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 1rem;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    flex-shrink: 0;
                }

                .input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .chat-input input {
                    width: 100%;
                    padding: 0.75rem 3rem 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 9999px;
                    outline: none;
                    font-size: 0.875rem;
                }

                .send-button {
                    position: absolute;
                    right: 0.5rem;
                    background: #d7ba5a;
                    color: white;
                    border: none;
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .thinking {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .thinking-dots {
                    display: flex;
                    margin-left: 0.5rem;
                }

                .thinking-dots span {
                    width: 4px;
                    height: 4px;
                    margin: 0 2px;
                    background-color: #6b7280;
                    border-radius: 50%;
                    animation: thinking 1.4s infinite;
                }

                .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
                .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

                @keyframes thinking {
                    0%, 80%, 100% { transform: scale(0); opacity: 0; }
                    40% { transform: scale(1); opacity: 1; }
                }

                .chat-button .btn-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(0, 0, 0, 0.2);
                    border-top-color: #000;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                    margin-right: 0.5rem;
                    flex-shrink: 0;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            shadowRoot.appendChild(style);

            // Create chat button
            const chatButton = document.createElement('button');
            chatButton.className = 'chat-button';
            chatButton.textContent = 'Ask RENEW.org';
            chatButton.setAttribute('aria-label', 'Open Chat');
            shadowRoot.appendChild(chatButton);

            // Create chat container
            const chatContainer = document.createElement('div');
            chatContainer.className = 'chat-container';
            chatContainer.style.display = 'none'; // Ensure it starts hidden

            // Add chat content
            chatContainer.innerHTML = `
                <div class="chat-header">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <img src="https://renewchatbot2.vercel.app/images/renew-logo-with-circle_d6b959-2.png" alt="Renew.org" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div>
                            <div style="font-weight: 500;">Ask RENEW.org</div>
                        </div>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-input">
                    <div class="input-container">
                        <input type="text" placeholder="Ask RENEW.org" id="chat-input">
                        <button class="send-button" id="send-button" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13"></path>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            shadowRoot.appendChild(chatContainer);

            let isChatVisible = false;
            let conversationStarted = false;
            let isStartingConversation = false;
            let messages = [];
            let currentAbortController = null;

            // Helper function to scroll to bottom
            const scrollToBottom = (smooth = true) => {
                const messagesContainer = shadowRoot.querySelector('#chat-messages');
                if (messagesContainer) {
                    const scrollOptions = {
                        top: messagesContainer.scrollHeight,
                        behavior: smooth ? 'smooth' : 'auto'
                    };
                    messagesContainer.scrollTo(scrollOptions);
                }
            };

            // Helper function to convert plain URLs to clickable links (displaying the URL as text)
            const linkify = (text) => {
                if (!text) return text;
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                return text.replace(urlRegex, (url) => {
                    // Remove trailing punctuation from URL
                    const cleanedUrl = url.replace(/[.,;!?)]+$/, '');
                    return `<a href="${cleanedUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; cursor: pointer; word-break: break-all;">${cleanedUrl}</a>`;
                });
            };

            // Helper function to safely set HTML content
            const setInnerHTML = (element, html) => {
                // Create a temporary div
                const temp = document.createElement('div');
                temp.innerHTML = html;
                // Only allow a and text nodes
                const sanitized = Array.from(temp.childNodes)
                    .filter(node => node.nodeType === 3 || (node.nodeType === 1 && node.nodeName === 'A'))
                    .map(node => {
                        if (node.nodeType === 1 && node.nodeName === 'A') {
                            const a = document.createElement('a');
                            a.href = node.href;
                            a.textContent = node.textContent;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                            a.style.color = 'inherit';
                            a.style.textDecoration = 'underline';
                            a.style.cursor = 'pointer';
                            a.style.wordBreak = 'break-all';
                            // Add click event listener
                            a.addEventListener('click', (e) => {
                                e.preventDefault();
                                window.open(a.href, '_blank');
                            });
                            return a;
                        }
                        return node.cloneNode(true);
                    });
                // Clear the element and append sanitized nodes
                element.innerHTML = '';
                sanitized.forEach(node => element.appendChild(node));
            };

            // Helper function to add message to chat
            const addMessage = (role, content) => {
                const messagesContainer = shadowRoot.querySelector('#chat-messages');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${role === 'user' ? 'user' : 'bot'}`;
                setInnerHTML(messageDiv, linkify(content));
                messagesContainer.appendChild(messageDiv);
                if (role === 'user') {
                    scrollToBottom();
                }
                messages.push({ role, content });
            };

            // Helper function to show thinking indicator
            const showThinking = () => {
                const messagesContainer = shadowRoot.querySelector('#chat-messages');
                const thinkingDiv = document.createElement('div');
                thinkingDiv.className = 'thinking';
                thinkingDiv.innerHTML = `
                    Thinking
                    <div class="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                `;
                messagesContainer.appendChild(thinkingDiv);
                scrollToBottom();
                return thinkingDiv;
            };

            // Handle input and send button
            const input = shadowRoot.querySelector('#chat-input');
            const sendButton = shadowRoot.querySelector('#send-button');

            input.addEventListener('input', (e) => {
                sendButton.disabled = !e.target.value.trim();
            });

            const parseSSE = (text) => {
                const events = [];
                const blocks = text.split('\n\n');
                for (const block of blocks) {
                    if (!block.trim()) continue;
                    let eventType = null;
                    let data = '';
                    for (const line of block.split('\n')) {
                        if (line.startsWith('event:')) {
                            eventType = line.slice(6).trim();
                        } else if (line.startsWith('data:')) {
                            data += line.slice(5).trim();
                        }
                    }
                    if (eventType && data) {
                        try {
                            events.push({ event: eventType, data: JSON.parse(data) });
                        } catch {
                            events.push({ event: eventType, data: { raw: data } });
                        }
                    }
                }
                return events;
            };

            const sendMessage = async () => {
                const message = input.value.trim();
                if (!message) return;

                if (currentAbortController) {
                    currentAbortController.abort();
                }
                currentAbortController = new AbortController();

                addMessage('user', message);
                const thinkingIndicator = showThinking();
                input.value = '';
                sendButton.disabled = true;

                let currentBotMessage = null;
                let accumulatedText = '';

                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message,
                            deviceId,
                            userAgent: navigator.userAgent,
                            filters: {}
                        }),
                        signal: currentAbortController.signal
                    });

                    if (!response.ok) {
                        throw new Error(`Server error: ${response.status}`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });

                        const parts = buffer.split('\n\n');
                        buffer = parts.pop();

                        const events = parseSSE(parts.join('\n\n'));

                        for (const { event, data } of events) {
                            // debugger
                            if (event === 'meta') {
                                continue;
                            }

                            if (event === 'title') {
                                continue;
                            }

                            if (event === 'token') {
                                if (thinkingIndicator && thinkingIndicator.parentNode) {
                                    thinkingIndicator.remove();
                                }
                                if (!currentBotMessage) {
                                    const messagesContainer = shadowRoot.querySelector('#chat-messages');
                                    currentBotMessage = document.createElement('div');
                                    currentBotMessage.className = 'message bot';
                                    messagesContainer.appendChild(currentBotMessage);
                                }
                                accumulatedText += data.text || '';
                                setInnerHTML(currentBotMessage, linkify(accumulatedText));
                            }

                            if (event === 'done') {
                                debugger
                                if (thinkingIndicator && thinkingIndicator.parentNode) {
                                    thinkingIndicator.remove();
                                }
                                if (data.answer && !currentBotMessage) {
                                    addMessage('bot', data.answer);
                                } else if (data.answer && currentBotMessage) {
                                    setInnerHTML(currentBotMessage, linkify(data.answer));
                                }
                                // if (data.citations && data.citations.length > 0) {
                                //     const linksText = data.citations
                                //         .map(c => c.url || c.link || c.productPage)
                                //         .filter(Boolean)
                                //         .join('\n');
                                //     if (linksText) {
                                //         const messagesContainer = shadowRoot.querySelector('#chat-messages');
                                //         const citationDiv = document.createElement('div');
                                //         citationDiv.className = 'message bot';
                                //         setInnerHTML(citationDiv, linkify('Sources:\n' + linksText));
                                //         messagesContainer.appendChild(citationDiv);
                                //     }
                                // }
                                // messages.push({ role: 'bot', content: data.answer || accumulatedText });
                                // scrollToBottom();
                            }

                            if (event === 'error') {
                                if (thinkingIndicator && thinkingIndicator.parentNode) {
                                    thinkingIndicator.remove();
                                }
                                addStatusMessage(data.message || 'An error occurred', true);
                            }
                        }
                    }

                    if (buffer.trim()) {
                        const remaining = parseSSE(buffer);
                        for (const { event, data } of remaining) {
                            if (event === 'token' && data.text) {
                                if (!currentBotMessage) {
                                    const messagesContainer = shadowRoot.querySelector('#chat-messages');
                                    currentBotMessage = document.createElement('div');
                                    currentBotMessage.className = 'message bot';
                                    messagesContainer.appendChild(currentBotMessage);
                                }
                                accumulatedText += data.text;
                                setInnerHTML(currentBotMessage, linkify(accumulatedText));
                            }
                        }
                    }

                } catch (err) {
                    if (err.name === 'AbortError') return;
                    console.error('Chat stream error:', err);
                    if (thinkingIndicator && thinkingIndicator.parentNode) {
                        thinkingIndicator.remove();
                    }
                    addStatusMessage('Failed to get a response. Please try again.', true);
                } finally {
                    currentAbortController = null;
                }
            };

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });

            sendButton.addEventListener('click', sendMessage);

            const addStatusMessage = (message, isError = false) => {
                const messagesContainer = shadowRoot.querySelector('#chat-messages');
                const statusDiv = document.createElement('div');
                statusDiv.className = `message bot ${isError ? 'error' : ''}`;
                statusDiv.style.backgroundColor = isError ? '#fee2e2' : '#f3f4f6';
                statusDiv.style.color = isError ? '#991b1b' : '#374151';
                statusDiv.textContent = message;
                messagesContainer.appendChild(statusDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            };

            // Add keyboard event handlers for mobile
            const handleMobileKeyboard = () => {
                const isMobile = window.innerWidth <= 767;
                if (!isMobile) return;

                const visualViewport = window.visualViewport;
                if (!visualViewport) return;

                visualViewport.addEventListener('resize', () => {
                    const chatContainer = shadowRoot.querySelector('.chat-container');
                    const chatButton = shadowRoot.querySelector('.chat-button');

                    if (!chatContainer || !chatButton) return;

                    const isKeyboardOpen = visualViewport.height < window.innerHeight;

                    chatContainer.classList.toggle('keyboard-open', isKeyboardOpen);
                    chatButton.classList.toggle('hidden', isKeyboardOpen);

                    // Scroll to bottom when keyboard opens
                    if (isKeyboardOpen) {
                        const messagesContainer = shadowRoot.querySelector('#chat-messages');
                        if (messagesContainer) {
                            setTimeout(() => {
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }, 100);
                        }
                    }
                });
            };

            // Initialize keyboard handling
            handleMobileKeyboard();

            const showChat = () => {
                isChatVisible = true;
                chatContainer.style.display = 'flex';
                chatButton.classList.add('chat-open');
                input.focus();
                setTimeout(() => {
                    const messagesContainer = shadowRoot.querySelector('#chat-messages');
                    if (messagesContainer) {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }
                }, 100);
            };

            const hideChat = () => {
                isChatVisible = false;
                chatContainer.style.display = 'none';
                chatButton.classList.remove('chat-open');
            };

            const startConversation = async () => {
                if (isStartingConversation) return;
                isStartingConversation = true;

                const originalText = chatButton.textContent;
                chatButton.innerHTML = '<div class="btn-spinner"></div> Loading...';
                chatButton.disabled = true;

                try {
                    const res = await fetch(API_BASE + '/conversations/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            deviceId,
                            userAgent: navigator.userAgent
                        })
                    });
                    if (!res.ok) throw new Error(`Server error: ${res.status}`);
                    conversationStarted = true;
                    showChat();
                } catch (err) {
                    console.error('Failed to start conversation:', err);
                    chatButton.textContent = originalText;
                } finally {
                    chatButton.disabled = false;
                    chatButton.textContent = originalText;
                    isStartingConversation = false;
                }
            };

            chatButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isChatVisible) {
                    hideChat();
                } else if (conversationStarted) {
                    showChat();
                } else {
                    startConversation();
                }
            });

            // Prevent chat container clicks from bubbling up
            chatContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            document.addEventListener('click', (event) => {
                if (isChatVisible && !chatButton.contains(event.target) && !chatContainer.contains(event.target)) {
                    hideChat();
                }
            });

            // Add scroll event listener to prevent propagation
            const messagesContainer = shadowRoot.querySelector('#chat-messages');
            messagesContainer.addEventListener('wheel', (e) => {
                const { scrollTop, scrollHeight, clientHeight } = messagesContainer;

                // Prevent scroll propagation when at the top or bottom
                if (
                    (scrollTop <= 0 && e.deltaY < 0) || // At top and scrolling up
                    (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) // At bottom and scrolling down
                ) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Handle touch events for mobile
            let touchStartY;
            messagesContainer.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            });

            messagesContainer.addEventListener('touchmove', (e) => {
                if (!touchStartY) return;

                const touchY = e.touches[0].clientY;
                const { scrollTop, scrollHeight, clientHeight } = messagesContainer;

                // Prevent scroll propagation when at the boundaries
                if (
                    (scrollTop <= 0 && touchY > touchStartY) || // At top and pulling down
                    (scrollTop + clientHeight >= scrollHeight && touchY < touchStartY) // At bottom and pulling up
                ) {
                    e.preventDefault();
                }
            }, { passive: false });

            messagesContainer.addEventListener('touchend', () => {
                touchStartY = null;
            });
    })();
})();