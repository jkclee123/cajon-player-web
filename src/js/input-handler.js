/**
 * InputHandler - Handles user input events (mouse, touch, keyboard)
 * Coordinates with TriggerZoneManager and AudioManager
 */

class InputHandler {
    constructor(config) {
        this.zoneManager = config.zoneManager;
        this.audioManager = config.audioManager;
        this.onZoneActivated = config.onZoneActivated || null;
        this.enabled = true;
        this.hasFocus = true;
        
        // Bound event handlers (for cleanup)
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleTouch = this.handleTouch.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleFocus = this.handleFocus.bind(this);
        this.boundHandleBlur = this.handleBlur.bind(this);
    }

    /**
     * Attaches event listeners for mouse, touch, and keyboard input
     */
    initialize() {
        // Mouse click events
        document.addEventListener('click', this.boundHandleClick, true);
        
        // Touch events
        document.addEventListener('touchstart', this.boundHandleTouch, { passive: false });
        
        // Keyboard events
        document.addEventListener('keydown', this.boundHandleKeydown);
        
        // Focus/blur events for keyboard input
        window.addEventListener('focus', this.boundHandleFocus);
        window.addEventListener('blur', this.boundHandleBlur);
    }

    /**
     * Removes all event listeners
     */
    destroy() {
        document.removeEventListener('click', this.boundHandleClick, true);
        document.removeEventListener('touchstart', this.boundHandleTouch);
        document.removeEventListener('keydown', this.boundHandleKeydown);
        window.removeEventListener('focus', this.boundHandleFocus);
        window.removeEventListener('blur', this.boundHandleBlur);
    }

    /**
     * Enables input handling
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disables input handling
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Handles mouse click events
     * @param {MouseEvent} event
     */
    handleClick(event) {
        if (!this.enabled) return;
        
        const zone = this.zoneManager.getZoneByElement(event.target);
        if (zone) {
            event.preventDefault();
            event.stopPropagation();
            this._triggerZone(zone);
        }
    }

    /**
     * Handles touch events
     * @param {TouchEvent} event
     */
    handleTouch(event) {
        if (!this.enabled) return;
        
        const touch = event.touches[0];
        if (!touch) return;
        
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const zone = this.zoneManager.getZoneByElement(element);
        
        if (zone) {
            event.preventDefault();
            event.stopPropagation();
            this._triggerZone(zone);
        }
    }

    /**
     * Handles keyboard keydown events
     * @param {KeyboardEvent} event
     */
    handleKeydown(event) {
        if (!this.enabled || !this.hasFocus) return;
        
        // Check if shift keys are being used as primary keys (not modifiers)
        const isShiftKey = event.code === 'ShiftLeft' || event.code === 'ShiftRight';
        let keyToCheck;
        
        if (isShiftKey) {
            // Map shift key codes to our key names
            keyToCheck = event.code === 'ShiftLeft' ? 'leftshift' : 'rightshift';
        } else {
            // Ignore modifier keys when used as modifiers (not primary keys)
            if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
                return;
            }
            keyToCheck = event.key.toLowerCase();
        }
        const zone = this.zoneManager.getZoneByKey(keyToCheck);
        
        if (zone) {
            event.preventDefault();
            event.stopPropagation();
            this._triggerZone(zone);
        }
    }

    /**
     * Handles window focus event
     */
    handleFocus() {
        this.hasFocus = true;
    }

    /**
     * Handles window blur event
     */
    handleBlur() {
        this.hasFocus = false;
    }

    /**
     * Triggers a zone (plays sound and activates visual feedback)
     * @private
     */
    async _triggerZone(zone) {
        try {
            // Play sound
            await this.audioManager.playSound(zone.soundFile);
            
            // Activate visual feedback
            this.zoneManager.activateZone(zone.id);
            
            // Call optional callback
            if (this.onZoneActivated) {
                this.onZoneActivated(zone.id);
            }
        } catch (error) {
            console.error(`Failed to trigger zone ${zone.id}:`, error);
            // Don't block UI - allow retry on next interaction
        }
    }
}

