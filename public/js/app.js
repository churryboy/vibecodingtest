// CPA Calculator Chat Application
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
        
        this.initializeEventListeners();
        this.adjustTextareaHeight();
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
    
    connectSpreadsheet() {
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
        
        // Simulate connection (in real app, this would validate with backend)
        this.connectButton.textContent = 'Connecting...';
        this.connectButton.disabled = true;
        
        setTimeout(() => {
            this.isConnected = true;
            this.spreadsheetLink = url;
            this.showConnectionStatus('✓ Successfully connected to spreadsheet', 'success');
            this.connectButton.textContent = 'Connected';
            this.connectButton.style.backgroundColor = '#34c759';
            
            // Add system message
            this.addMessage('assistant', 'Great! I\'ve connected to your Google Spreadsheet. You can now ask me questions about your CPA data, and I\'ll analyze it for you.');
        }, 1000);
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
        
        // Add user message
        this.addMessage('user', message);
        
        // Clear input
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        
        // Show typing indicator
        const typingId = this.showTypingIndicator();
        
        // Simulate API call (in real app, this would call your backend)
        setTimeout(() => {
            this.removeTypingIndicator(typingId);
            
            // Generate response based on message content
            let response = this.generateResponse(message);
            this.addMessage('assistant', response);
        }, 1000 + Math.random() * 1000);
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (!this.isConnected) {
            return 'Please connect your Google Spreadsheet first by entering the URL above and clicking "Connect".';
        }
        
        // Simulate different responses based on keywords
        if (lowerMessage.includes('cpa') || lowerMessage.includes('cost per acquisition')) {
            return 'Based on your spreadsheet data, I can see your average CPA across all campaigns is $45.32. Your most efficient campaign is "Summer Sale 2024" with a CPA of $28.50, while "Brand Awareness Q4" has the highest CPA at $67.89. Would you like me to break down the factors contributing to these numbers?';
        } else if (lowerMessage.includes('roi') || lowerMessage.includes('return')) {
            return 'Looking at your ROI data: Your overall ROI is 312%, which is excellent. The "Email Retargeting" campaign shows the highest ROI at 485%, while "Social Media Broad" is underperforming at 145%. I recommend reallocating budget from the latter to your high-performing campaigns.';
        } else if (lowerMessage.includes('budget')) {
            return 'Your current monthly marketing budget is $50,000. Based on performance data, I suggest: 40% ($20,000) for Search Ads, 30% ($15,000) for Email Marketing, 20% ($10,000) for Social Media, and 10% ($5,000) for testing new channels. This allocation would optimize for your lowest CPA channels.';
        } else if (lowerMessage.includes('improve') || lowerMessage.includes('optimize')) {
            return 'To improve your CPA, I recommend:\n\n1. Increase budget for "Email Retargeting" by 25% (projected CPA decrease of $8)\n2. Pause "Display Network - Broad" campaign (current CPA is 3x your target)\n3. A/B test new ad creatives in your "Search - Brand" campaign\n4. Implement dayparting for social media ads (your data shows 60% better CPA during 2-5 PM)\n\nThese changes could reduce your overall CPA by approximately 18%.';
        } else if (lowerMessage.includes('campaign') || lowerMessage.includes('performance')) {
            return 'Here\'s your campaign performance summary:\n\n📊 Top Performers:\n• Email Retargeting: CPA $22, ROI 485%\n• Search - Brand: CPA $31, ROI 390%\n• Shopping Ads: CPA $35, ROI 340%\n\n📉 Needs Improvement:\n• Display Network: CPA $89, ROI 145%\n• Social - Broad: CPA $76, ROI 165%\n\nWould you like detailed metrics for any specific campaign?';
        } else {
            return 'I can help you analyze your CPA data from the connected spreadsheet. Try asking me about:\n\n• Your current CPA by campaign\n• ROI analysis\n• Budget optimization recommendations\n• Campaign performance comparisons\n• Improvement strategies\n\nWhat would you like to know?';
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
