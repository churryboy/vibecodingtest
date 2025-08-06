// CPA Calculator Chat Application with API Integration
class CPACalculator {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.spreadsheetUrl = document.getElementById('spreadsheetUrl');
        this.connectButton = document.getElementById('connectButton');
        this.connectionStatus = document.getElementById('connectionStatus');
        
        this.isConnected = false;
        this.spreadsheetLink = '';
        this.sessionId = this.generateSessionId();
        
        this.initializeEventListeners();
        this.adjustTextareaHeight();
    }
    
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }
    
    initializeEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());
        
        // Connect spreadsheet
        this.connectButton.addEventListener('click', () => this.connectSpreadsheet());
        this.spreadsheetUrl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.connectSpreadsheet();
            }
        });
    }
    
    adjustTextareaHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async connectSpreadsheet() {
        const url = this.spreadsheetUrl.value.trim();
        
        if (!url) {
            this.showConnectionStatus('Please enter a Google Spreadsheet URL', 'error');
            return;
        }
        
        // Basic validation for Google Sheets URL
        if (!url.includes('docs.google.com/spreadsheets')) {
            this.showConnectionStatus('Please enter a valid Google Spreadsheet URL', 'error');
            return;
        }
        
        this.connectButton.textContent = 'Connecting...';
        this.connectButton.disabled = true;
        
        try {
            const response = await fetch('/api/connect-spreadsheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.isConnected = true;
                this.spreadsheetLink = url;
                this.showConnectionStatus('✓ ' + data.message, 'success');
                this.connectButton.textContent = 'Connected';
                this.connectButton.style.backgroundColor = '#34c759';
                
                // Add system message
                this.addMessage('assistant', `Great! I've connected to your Google Spreadsheet. You can now ask me questions about your CPA data, and I'll analyze it for you.`);
            } else {
                throw new Error(data.error || 'Connection failed');
            }
        } catch (error) {
            this.showConnectionStatus(error.message, 'error');
            this.connectButton.textContent = 'Connect';
            this.connectButton.disabled = false;
        }
    }
    
    showConnectionStatus(message, type) {
        this.connectionStatus.textContent = message;
        this.connectionStatus.className = `connection-status ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                this.connectionStatus.textContent = '';
                this.connectionStatus.className = 'connection-status';
            }, 5000);
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Disable input while processing
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        
        // Add user message
        this.addMessage('user', message);
        
        // Clear input
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        
        // Show typing indicator
        const typingId = this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': this.sessionId
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            this.removeTypingIndicator(typingId);
            
            if (response.ok) {
                this.addMessage('assistant', data.response);
                if (data.isDemo) {
                    console.log('Running in demo mode - no API keys configured');
                }
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('assistant', `I apologize, but I encountered an error: ${error.message}. Please try again.`);
        } finally {
            // Re-enable input
            this.messageInput.disabled = false;
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }
    
    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Handle multi-line content
        const lines = content.split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                const p = document.createElement('p');
                p.textContent = line;
                contentDiv.appendChild(p);
            }
        });
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const typingId = 'typing-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        messageDiv.id = typingId;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return typingId;
    }
    
    removeTypingIndicator(typingId) {
        const indicator = document.getElementById(typingId);
        if (indicator) {
            indicator.remove();
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CPACalculator();
});
