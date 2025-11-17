/**
 * DebugLogger - Prints debug information to an on-page panel and console
 */
(function () {
    class DebugLogger {
        static initialized = false;
        static enabled = false; // Set to false to disable all logging
        static contentEl = null;
        static panelEl = null;
        static maxLines = 500;
        static lineCount = 0;
        static buffer = [];

        static init() {
            if (this.initialized) return;
            this.contentEl = document.getElementById('debug-content');
            this.panelEl = document.getElementById('debug-panel');
            const clearBtn = document.getElementById('clear-debug');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clear();
                    if (this.enabled) {
                        this.log('Debug log cleared');
                    }
                });
            }
            this.initialized = true;
            this.updateVisibility();
            if (this.enabled) {
                this.log('DebugLogger initialized');
            }
        }

        static setEnabled(enabled) {
            this.enabled = enabled;
            this.updateVisibility();
        }

        static updateVisibility() {
            if (this.panelEl) {
                this.panelEl.style.display = this.enabled ? 'block' : 'none';
            }
        }

        static format(value) {
            try {
                if (typeof value === 'string') return value;
                if (value instanceof Event) {
                    return `[Event type=${value.type}]`;
                }
                if (value && typeof value === 'object') {
                    return JSON.stringify(value, (k, v) => {
                        if (v instanceof Node) return `[Node ${v.nodeName}${v.id ? `#${v.id}` : ''}]`;
                        if (v instanceof Window) return '[Window]';
                        return v;
                    });
                }
                return String(value);
            } catch (e) {
                return String(value);
            }
        }

        static log(...args) {
            if (!this.enabled) return;

            // Always mirror to console (even when disabled)
            try { console.log('[DBG]', ...args); } catch (_) {}

            if (!this.initialized) this.init();
            if (!this.contentEl) return;

            const timestamp = new Date().toISOString();
            const text = args.map(a => this.format(a)).join(' ');
            const line = `[${timestamp}] ${text}`;

            this.buffer.push(line);
            this.lineCount += 1;
            if (this.buffer.length > this.maxLines) {
                this.buffer.splice(0, this.buffer.length - this.maxLines);
                this.lineCount = this.buffer.length;
            }
            this.contentEl.textContent = this.buffer.join('\n');
            // Scroll to bottom
            this.contentEl.scrollTop = this.contentEl.scrollHeight;
        }

        static error(...args) {
            // Always mirror to console (even when disabled)
            try { console.error('[DBG][ERROR]', ...args); } catch (_) {}
            
            if (!this.enabled) return;
            this.log('[ERROR]', ...args);
        }

        static clear() {
            this.buffer = [];
            this.lineCount = 0;
            if (this.contentEl) this.contentEl.textContent = '';
        }
    }

    window.DebugLogger = DebugLogger;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            DebugLogger.init();
            DebugLogger.log('Page loaded, DebugLogger ready');
        });
    } else {
        // DOM already loaded
        DebugLogger.init();
        DebugLogger.log('Page already loaded, DebugLogger ready');
    }
})();


