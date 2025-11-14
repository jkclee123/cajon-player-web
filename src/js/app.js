/**
 * App - Main application coordinator
 * Initializes all modules and manages application lifecycle
 */

class App {
    constructor(config) {
        this.config = config || {};
        this.container = config.container || document.getElementById('app');
        this.zones = config.zones || [];
        this.sounds = config.sounds || [];
        
        // Module instances
        this.audioManager = null;
        this.zoneManager = null;
        this.inputHandler = null;
        
        // State
        this.isReady = false;
        this.hasFocus = true;
        
        // DOM references
        this.loadingIndicator = null;
        this.errorMessage = null;
        this.keyboardHint = null;
        this.keyRecordingPopup = null;
        this.currentRecordingZoneId = null;
        this.keyRecordingHandler = null;
    }

    /**
     * Initializes the application
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Get DOM references
            this.loadingIndicator = document.getElementById('loading-indicator');
            this.errorMessage = document.getElementById('error-message');
            this.keyboardHint = document.getElementById('keyboard-hint');
            
            // Show loading indicator
            if (this.loadingIndicator) {
                this.loadingIndicator.classList.remove('hidden');
            }
            
            // Initialize AudioManager
            this.audioManager = new AudioManager({
                sounds: this.sounds,
                poolSize: 3
            });
            
            // Set up audio loading progress tracking
            this.audioManager.on('progress', (progress) => {
                this._updateLoadingProgress(progress);
            });
            
            this.audioManager.on('error', (error) => {
                this._handleError(error);
            });
            
            // Initialize TriggerZoneManager
            const cajonContainer = document.getElementById('cajon-container');
            if (!cajonContainer) {
                throw new Error('Cajon container element not found');
            }
            
            this.zoneManager = new TriggerZoneManager({
                zones: this.zones,
                container: cajonContainer,
                cajonImage: 'src/assets/images/cajon.png'
            });
            
            // Initialize zones (create DOM elements)
            this.zoneManager.initialize();
            
            // Preload all sounds
            await this.audioManager.preloadAll();
            
            // Initialize InputHandler
            this.inputHandler = new InputHandler({
                zoneManager: this.zoneManager,
                audioManager: this.audioManager,
                onZoneActivated: (zoneId) => {
                    // Optional callback for zone activation
                }
            });
            this.inputHandler.initialize();
            
            // Set up keyboard hint UI
            this._setupKeyboardHint();
            
            // Set up key recording popup
            this._setupKeyRecording();
            
            // Hide loading indicator
            if (this.loadingIndicator) {
                this.loadingIndicator.classList.add('hidden');
            }
            
            // Set up focus tracking
            this._setupFocusTracking();
            
            this.isReady = true;
            
        } catch (error) {
            this._handleError(error);
            throw error;
        }
    }

    /**
     * Updates loading progress indicator
     * @private
     */
    _updateLoadingProgress(progress) {
        if (this.loadingIndicator) {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            this.loadingIndicator.textContent = `Loading sounds... ${progress.loaded}/${progress.total} (${percentage}%)`;
        }
    }

    /**
     * Handles errors
     * @private
     */
    _handleError(error) {
        console.error('App error:', error);
        
        if (this.errorMessage) {
            this.errorMessage.textContent = `Error: ${error.message || 'An error occurred'}`;
            this.errorMessage.classList.add('show');
            this.errorMessage.style.display = 'block';
        }
    }

    /**
     * Sets up keyboard hint UI
     * @private
     */
    _setupKeyboardHint() {
        if (!this.keyboardHint) return;
        
        const keyboardKeysDiv = document.getElementById('keyboard-keys');
        if (!keyboardKeysDiv) return;
        
        // Get all zones with keyboard keys
        const zonesWithKeys = this.zones.filter(zone => zone.keyboardKey);
        
        // Create keyboard hint items
        zonesWithKeys.forEach(zone => {
            const item = document.createElement('div');
            item.className = 'keyboard-key-item';
            item.dataset.zoneId = zone.id;
            
            const keySpan = document.createElement('span');
            keySpan.className = 'key';
            keySpan.textContent = zone.keyboardKey.toUpperCase();
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'sound-name';
            nameSpan.textContent = zone.name;
            
            item.appendChild(keySpan);
            item.appendChild(nameSpan);
            
            // Add click handler for key programming
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this._startKeyRecording(zone.id, keySpan);
            });
            
            keyboardKeysDiv.appendChild(item);
        });
        
        // Show keyboard hint
        this.keyboardHint.style.display = 'block';
    }

    /**
     * Sets up key recording popup
     * @private
     */
    _setupKeyRecording() {
        this.keyRecordingPopup = document.getElementById('key-recording-popup');
        if (!this.keyRecordingPopup) return;
    }

    /**
     * Starts key recording for a zone
     * @private
     */
    _startKeyRecording(zoneId, keySpanElement) {
        if (!this.keyRecordingPopup) return;
        
        this.currentRecordingZoneId = zoneId;
        
        // Show popup
        this.keyRecordingPopup.style.display = 'block';
        const recordedKeyDiv = this.keyRecordingPopup.querySelector('.recorded-key');
        recordedKeyDiv.textContent = '';
        
        // Temporarily disable input handler to prevent conflicts
        if (this.inputHandler) {
            this.inputHandler.disable();
        }
        
        // Create one-time keydown handler
        this.keyRecordingHandler = (event) => {
            // Ignore modifier keys
            if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
                return;
            }
            
            // Ignore Escape key (could be used to cancel)
            if (event.key === 'Escape') {
                document.removeEventListener('keydown', this.keyRecordingHandler, { capture: true });
                this._cancelKeyRecording();
                return;
            }
            
            // Get the key
            const key = event.key.toLowerCase();
            
            // Only accept letter keys and numbers
            if (key.length === 1 && /[a-z0-9]/.test(key)) {
                event.preventDefault();
                event.stopPropagation();
                
                // Remove handler immediately to prevent multiple triggers
                document.removeEventListener('keydown', this.keyRecordingHandler, { capture: true });
                
                // Update the zone key
                this.zoneManager.updateZoneKey(zoneId, key);
                
                // Update the UI
                keySpanElement.textContent = key.toUpperCase();
                
                // Show recorded key briefly
                recordedKeyDiv.textContent = key.toUpperCase();
                
                // Close popup after a short delay
                setTimeout(() => {
                    this._cancelKeyRecording();
                }, 500);
            }
        };
        
        // Add event listener with capture to catch before input handler
        document.addEventListener('keydown', this.keyRecordingHandler, { capture: true });
    }

    /**
     * Cancels key recording
     * @private
     */
    _cancelKeyRecording() {
        if (this.keyRecordingHandler) {
            document.removeEventListener('keydown', this.keyRecordingHandler, { capture: true });
            this.keyRecordingHandler = null;
        }
        
        // Re-enable input handler
        if (this.inputHandler) {
            this.inputHandler.enable();
        }
        
        if (this.keyRecordingPopup) {
            this.keyRecordingPopup.style.display = 'none';
        }
        
        this.currentRecordingZoneId = null;
    }

    /**
     * Sets up window focus/blur tracking for keyboard input
     * @private
     */
    _setupFocusTracking() {
        window.addEventListener('focus', () => {
            this.hasFocus = true;
            if (this.inputHandler) {
                this.inputHandler.handleFocus();
            }
        });
        
        window.addEventListener('blur', () => {
            this.hasFocus = false;
            if (this.inputHandler) {
                this.inputHandler.handleBlur();
            }
        });
    }

    /**
     * Destroys the application and cleans up resources
     */
    destroy() {
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        
        // Clear event listeners
        // (focus/blur listeners will be cleaned up when page unloads)
        
        this.isReady = false;
    }
}

