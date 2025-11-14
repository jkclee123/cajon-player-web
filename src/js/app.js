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
                    // Hide error message on successful sound play
                    this._hideError();
                }
            });
            this.inputHandler.initialize();
            
            // Set up keyboard hint UI
            this._setupKeyboardHint();
            
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
     * Hides the error message
     * @private
     */
    _hideError() {
        if (this.errorMessage) {
            this.errorMessage.classList.remove('show');
            this.errorMessage.style.display = 'none';
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
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'sound-name';
            nameSpan.textContent = zone.name;
            
            item.appendChild(nameSpan);
            
            keyboardKeysDiv.appendChild(item);
        });
        
        // Show keyboard hint
        this.keyboardHint.style.display = 'block';
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

