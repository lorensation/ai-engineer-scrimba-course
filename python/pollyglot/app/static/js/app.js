/**
 * PollyGlot Translator App
 * Main JavaScript application logic
 */

class TranslatorApp {
    constructor() {
        this.currentTranslation = null;
        this.history = this.loadHistory();
        this.isTranslating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.renderHistory();
        this.updateCharCounter();
        this.loadTheme();
    }
    
    initializeElements() {
        // Input elements
        this.inputText = document.getElementById('input-text');
        this.sourceLanguage = document.getElementById('source-lang');
        this.targetLanguage = document.getElementById('target-lang');
        this.translateBtn = document.getElementById('translate-btn');
        this.charCount = document.getElementById('char-count');
        this.loadingSpinner = document.getElementById('loading-spinner');
        
        // Output elements
        this.outputSection = document.getElementById('output-section');
        this.outputText = document.getElementById('output-text');
        this.copyBtn = document.getElementById('copy-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Control elements
        this.swapBtn = document.getElementById('swap-languages');
        this.modelSelect = document.getElementById('model-select');
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Status elements
        this.latencyStatus = document.getElementById('latency-status').querySelector('.status-value');
        this.tokensStatus = document.getElementById('tokens-status').querySelector('.status-value');
        this.statusMessage = document.getElementById('status-message');
        
        // History elements
        this.historyList = document.getElementById('history-list');
        this.clearHistoryBtn = document.getElementById('clear-history');
        
        // Toast container
        this.toastContainer = document.getElementById('toast-container');
    }
    
    bindEvents() {
        // Input events
        this.inputText.addEventListener('input', () => {
            this.updateCharCounter();
            this.updateTranslateButtonState();
        });
        
        // Translation
        this.translateBtn.addEventListener('click', () => this.translate());
        
        // Language controls
        this.swapBtn.addEventListener('click', () => this.swapLanguages());
        this.sourceLanguage.addEventListener('change', () => this.updateTranslateButtonState());
        this.targetLanguage.addEventListener('change', () => this.updateTranslateButtonState());
        
        // Output actions
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.downloadTranslation());
        
        // History
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to translate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!this.isTranslating && this.canTranslate()) {
                    this.translate();
                }
            }
            
            // Escape to clear
            if (e.key === 'Escape' && this.inputText === document.activeElement) {
                this.inputText.value = '';
                this.updateCharCounter();
                this.updateTranslateButtonState();
            }
        });
    }
    
    updateCharCounter() {
        const count = this.inputText.value.length;
        this.charCount.textContent = count;
        
        // Update style based on character count
        if (count > 4500) {
            this.charCount.style.color = 'var(--color-error)';
        } else if (count > 4000) {
            this.charCount.style.color = 'var(--color-warning)';
        } else {
            this.charCount.style.color = '';
        }
    }
    
    canTranslate() {
        const hasText = this.inputText.value.trim().length > 0;
        const hasTarget = this.targetLanguage.value !== '';
        const notSameLanguage = this.sourceLanguage.value !== this.targetLanguage.value || this.sourceLanguage.value === 'auto';
        
        return hasText && hasTarget && notSameLanguage && !this.isTranslating;
    }
    
    updateTranslateButtonState() {
        const canTranslate = this.canTranslate();
        this.translateBtn.disabled = !canTranslate;
        
        if (this.sourceLanguage.value === this.targetLanguage.value && this.sourceLanguage.value !== 'auto') {
            this.showStatus('Source and target languages cannot be the same', 'error');
        } else {
            this.clearStatus();
        }
    }
    
    async translate() {
        if (!this.canTranslate()) return;
        
        this.setTranslating(true);
        this.clearStatus();
        
        const requestData = {
            text: this.inputText.value.trim(),
            source: this.sourceLanguage.value,
            target: this.targetLanguage.value,
            model: this.modelSelect.value
        };
        
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait before trying again.');
                }
                
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            this.displayTranslation(result);
            this.updateStatus(result);
            this.addToHistory(requestData, result);
            this.showToast('Translation completed successfully', 'success');
            
        } catch (error) {
            console.error('Translation error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
            this.showToast(`Translation failed: ${error.message}`, 'error');
        } finally {
            this.setTranslating(false);
        }
    }
    
    setTranslating(isTranslating) {
        this.isTranslating = isTranslating;
        this.translateBtn.disabled = isTranslating;
        this.translateBtn.classList.toggle('loading', isTranslating);
        
        if (isTranslating) {
            this.clearStatus();
        }
    }
    
    displayTranslation(result) {
        this.currentTranslation = result;
        this.outputText.textContent = result.text;
        this.outputText.classList.remove('placeholder');
        this.outputSection.classList.add('has-content');
        
        // Focus the output for screen readers
        this.outputText.focus();
    }
    
    updateStatus(result) {
        this.latencyStatus.textContent = `${Math.round(result.latency_ms)}ms`;
        this.tokensStatus.textContent = result.tokens_used || '-';
        
        let statusText = `Translated from ${this.getLanguageName(result.source_language)} to ${this.getLanguageName(result.target_language)}`;
        
        if (result.detected_language) {
            statusText += ` (detected: ${this.getLanguageName(result.detected_language)})`;
        }
        
        this.showStatus(statusText, 'success');
    }
    
    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
    }
    
    clearStatus() {
        this.statusMessage.textContent = '';
        this.statusMessage.className = 'status-message';
    }
    
    async copyToClipboard() {
        if (!this.currentTranslation) return;
        
        try {
            await navigator.clipboard.writeText(this.currentTranslation.text);
            this.showToast('Copied to clipboard', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentTranslation.text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('Copied to clipboard', 'success');
            } catch (fallbackError) {
                this.showToast('Failed to copy to clipboard', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    downloadTranslation() {
        if (!this.currentTranslation) return;
        
        const content = `Original (${this.getLanguageName(this.currentTranslation.source_language)}):\n${this.inputText.value}\n\nTranslation (${this.getLanguageName(this.currentTranslation.target_language)}):\n${this.currentTranslation.text}\n\nTranslated using: ${this.currentTranslation.model}\nDate: ${new Date().toLocaleString()}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `translation_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showToast('Translation downloaded', 'success');
    }
    
    swapLanguages() {
        const sourceValue = this.sourceLanguage.value;
        const targetValue = this.targetLanguage.value;
        
        // Don't swap if source is auto
        if (sourceValue === 'auto') {
            this.showToast('Cannot swap when source is auto-detect', 'warning');
            return;
        }
        
        // Swap language selections
        this.sourceLanguage.value = targetValue;
        this.targetLanguage.value = sourceValue;
        
        // If there's a current translation, swap the text content
        if (this.currentTranslation) {
            const originalText = this.inputText.value;
            const translatedText = this.currentTranslation.text;
            
            this.inputText.value = translatedText;
            this.outputText.textContent = originalText;
            
            // Update current translation object
            this.currentTranslation = {
                ...this.currentTranslation,
                text: originalText,
                source_language: targetValue,
                target_language: sourceValue
            };
        }
        
        this.updateCharCounter();
        this.updateTranslateButtonState();
        this.showToast('Languages swapped', 'success');
    }
    
    addToHistory(request, result) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            source: request.source,
            target: request.target,
            sourceText: request.text,
            targetText: result.text,
            model: result.model,
            latency: result.latency_ms
        };
        
        // Add to beginning of history
        this.history.unshift(historyItem);
        
        // Keep only last 5 items
        this.history = this.history.slice(0, 5);
        
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">No translations yet</div>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map(item => {
            const timestamp = new Date(item.timestamp).toLocaleString();
            const sourceText = this.truncateText(item.sourceText, 50);
            
            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-item-header">
                        <span class="history-languages">
                            ${this.getLanguageName(item.source)} → ${this.getLanguageName(item.target)}
                        </span>
                        <span class="history-timestamp">${timestamp}</span>
                    </div>
                    <div class="history-text">${sourceText}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.loadFromHistory(id);
            });
        });
    }
    
    loadFromHistory(id) {
        const item = this.history.find(h => h.id === id);
        if (!item) return;
        
        this.inputText.value = item.sourceText;
        this.sourceLanguage.value = item.source;
        this.targetLanguage.value = item.target;
        
        this.currentTranslation = {
            text: item.targetText,
            source_language: item.source,
            target_language: item.target,
            model: item.model,
            latency_ms: item.latency
        };
        
        this.displayTranslation(this.currentTranslation);
        this.updateCharCounter();
        this.updateTranslateButtonState();
        
        this.showToast('Loaded from history', 'success');
    }
    
    clearHistory() {
        if (this.history.length === 0) return;
        
        if (confirm('Are you sure you want to clear the translation history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('History cleared', 'success');
        }
    }
    
    loadHistory() {
        try {
            const stored = localStorage.getItem('pollyglot_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load history:', error);
            return [];
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem('pollyglot_history', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('theme-dark');
        
        body.classList.toggle('theme-dark', !isDark);
        
        try {
            localStorage.setItem('pollyglot_theme', !isDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
        
        this.showToast(`Switched to ${!isDark ? 'dark' : 'light'} theme`, 'success');
    }
    
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('pollyglot_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            const shouldUseDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
            
            document.body.classList.toggle('theme-dark', shouldUseDark);
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    getLanguageName(code) {
        const languageNames = {
            'auto': 'Auto-detect',
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'da': 'Danish',
            'no': 'Norwegian',
            'fi': 'Finnish',
            'pl': 'Polish',
            'tr': 'Turkish'
        };
        
        return languageNames[code] || code;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranslatorApp();
});