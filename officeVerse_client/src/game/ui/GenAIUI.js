import { sendPromptToGenAI } from '../../network/GenAIModule.js';

export default class GenAIUI {
    constructor(scene) {
        this.scene = scene;
        this.setupGenAIListeners();
    }

    setupGenAIListeners() {
        // Initialize API Key Module for GenAI
        import('../../network/APIKeyModule.js').then(module => {
            const { initializeAPIKeyManagement } = module;
            initializeAPIKeyManagement();
        });

        const closeBtn = document.getElementById('close-genai-btn');
        if (closeBtn) closeBtn.onclick = () => this.closeGenAIPanel();

        const sendBtn = document.getElementById('genai-send-btn');
        if (sendBtn) sendBtn.onclick = () => this.sendGenAIPrompt();

        const input = document.getElementById('genai-input');
        if (input) {
            // Prevent Phaser from capturing keyboard events when input is focused
            input.addEventListener('focus', () => {
                this.scene.input.keyboard.enabled = false;
            });

            input.addEventListener('blur', () => {
                this.scene.input.keyboard.enabled = true;
            });

            // Character counter
            const charCount = document.getElementById('genai-char-count');
            input.addEventListener('input', (e) => {
                if (charCount) {
                    charCount.textContent = `${e.target.value.length}/500`;
                    // Visual feedback when near limit
                    if (e.target.value.length > 450) {
                        charCount.style.color = 'rgba(255, 150, 100, 0.8)';
                    } else {
                        charCount.style.color = 'rgba(200, 200, 200, 0.5)';
                    }
                }
            });

            // Send on Enter
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendGenAIPrompt();
                }
            });
        }

        // Hide tips after first interaction
        const tipsEl = document.getElementById('genai-tips');
        if (tipsEl) {
            const hideAfterFirstMessage = () => {
                tipsEl.style.display = 'none';
                if (input) input.removeEventListener('focus', hideAfterFirstMessage);
            };
            if (input) input.addEventListener('focus', hideAfterFirstMessage);
        }
    }

    openGenAIPanel() {
        // Import here to avoid circular dependencies
        import('../../network/APIKeyModule.js').then(module => {
            const { showAPIKeyModal, isGenAIConfigured } = module;

            isGenAIConfigured().then(configured => {
                if (!configured) {
                    // Show API key configuration modal if not configured
                    showAPIKeyModal();
                } else {
                    // Show GenAI panel if API is configured
                    const overlay = document.getElementById('genai-panel-overlay');
                    if (overlay) {
                        overlay.style.display = 'flex';
                        const input = document.getElementById('genai-input');
                        if (input) input.focus();
                    }
                    // Clear previous chat history when opening panel
                    this.clearGenAIHistory();
                }
            });
        });
    }

    closeGenAIPanel() {
        const overlay = document.getElementById('genai-panel-overlay');
        if (overlay) overlay.style.display = 'none';
        const input = document.getElementById('genai-input');
        if (input) input.value = '';
    }

    async sendGenAIPrompt() {
        const input = document.getElementById('genai-input');
        if (!input || !input.value.trim()) return;

        const prompt = input.value.trim();
        input.value = '';

        // Add user message to chat history
        this.addGenAIMessage(prompt, 'user');

        // Show loading state
        const loadingDiv = document.getElementById('genai-loading');
        const sendBtn = document.getElementById('genai-send-btn');
        if (loadingDiv) loadingDiv.style.display = 'flex';
        if (sendBtn) sendBtn.disabled = true;

        try {
            // Send prompt to backend server
            const response = await sendPromptToGenAI(prompt, this.scene.roomId);
            this.addGenAIMessage(response, 'ai');
        } catch (error) {
            console.error('GenAI Error:', error);
            const errorMsg = `❌ Error: ${error.message}`;
            this.addGenAIMessage(errorMsg, 'system');
        } finally {
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (sendBtn) sendBtn.disabled = false;
            const inputElement = document.getElementById('genai-input');
            if (inputElement) inputElement.focus();
        }
    }

    addGenAIMessage(text, sender = 'system') {
        const chatHistory = document.getElementById('genai-chat-history');
        if (!chatHistory) return;

        const messageEl = document.createElement('div');
        messageEl.className = `genai-message ${sender}`;
        messageEl.textContent = text;
        chatHistory.appendChild(messageEl);

        // Auto-scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    clearGenAIHistory() {
        const chatHistory = document.getElementById('genai-chat-history');
        if (chatHistory) {
            chatHistory.innerHTML = '<div class="genai-message system"><strong>Welcome!</strong> I\'m powered by Mistral AI. Ask me questions, get advice, or brainstorm ideas!</div>';
        }
    }
}
