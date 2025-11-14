/**
 * InputHandler - Handles user input events (pointer, keyboard)
 * Coordinates with TriggerZoneManager and AudioManager
 * Optimized for mobile performance with immediate visual feedback
 */

class InputHandler {
    constructor(config) {
        this.zoneManager = config.zoneManager;
        this.audioManager = config.audioManager;
        this.container = config.container || null; // Container element for event delegation
        this.onZoneActivated = config.onZoneActivated || null;
        this.enabled = true;
        this.hasFocus = true;
        
        // Track if we've unlocked audio context
        this.audioUnlocked = false;
        
        // Bound event handlers (for cleanup)
        this.boundHandlePointerDown = this.handlePointerDown.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleFocus = this.handleFocus.bind(this);
        this.boundHandleBlur = this.handleBlur.bind(this);
    }

    /**
     * Attaches event listeners for pointer and keyboard input
     */
    initialize() {
        // Get container element from zoneManager if not provided
        if (!this.container) {
            this.container = this.zoneManager.container;
        }
        
        if (!this.container) {
            throw new Error('Container element required for InputHandler');
        }
        
        // Pointer events (handles mouse, touch, pen) - attach to container for better performance
        // Non-passive because we may call preventDefault() when zone is found
        this.container.addEventListener('pointerdown', this.boundHandlePointerDown, { passive: false });
        
        // Also listen for clicks on keyboard-key-item elements (they're outside the cajon-container)
        const keyboardHint = document.getElementById('keyboard-hint');
        if (keyboardHint) {
            keyboardHint.addEventListener('pointerdown', this.boundHandlePointerDown, { passive: false });
        }
        
        // Keyboard events - still on document for global keyboard support
        document.addEventListener('keydown', this.boundHandleKeydown);
        
        // Focus/blur events for keyboard input
        window.addEventListener('focus', this.boundHandleFocus);
        window.addEventListener('blur', this.boundHandleBlur);
    }

    /**
     * Removes all event listeners
     */
    destroy() {
        if (this.container) {
            this.container.removeEventListener('pointerdown', this.boundHandlePointerDown);
        }
        const keyboardHint = document.getElementById('keyboard-hint');
        if (keyboardHint) {
            keyboardHint.removeEventListener('pointerdown', this.boundHandlePointerDown);
        }
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
     * Handles pointer down events (mouse, touch, pen)
     * @param {PointerEvent} event
     */
    handlePointerDown(event) {
        if (!this.enabled) return;
        
        // Unlock audio context on first interaction
        if (!this.audioUnlocked && this.audioManager) {
            this.audioManager.unlockAudioContext().catch(err => {
                console.error('Failed to unlock audio context:', err);
            });
            this.audioUnlocked = true;
        }
        
        // Check if clicked element is a keyboard-key-item
        let clickedElement = event.target;
        while (clickedElement && clickedElement !== document.body) {
            if (clickedElement.classList && clickedElement.classList.contains('keyboard-key-item')) {
                const zoneId = clickedElement.dataset.zoneId;
                if (zoneId) {
                    const zone = this.zoneManager.getZoneById(zoneId);
                    if (zone) {
                        event.preventDefault();
                        event.stopPropagation();
                        this._triggerZone(zone);
                        return;
                    }
                }
            }
            clickedElement = clickedElement.parentElement;
        }
        
        // Otherwise, check for trigger zone element
        const zone = this.zoneManager.getZoneByElement(event.target);
        if (zone) {
            // Prevent default to avoid double-triggering on mobile
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
        
        // Unlock audio context on first interaction
        if (!this.audioUnlocked && this.audioManager) {
            this.audioManager.unlockAudioContext().catch(err => {
                console.error('Failed to unlock audio context:', err);
            });
            this.audioUnlocked = true;
        }
        
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
     * Visual feedback is triggered IMMEDIATELY, audio plays non-blocking
     * @private
     */
    _triggerZone(zone) {
        // Activate visual feedback IMMEDIATELY (before audio)
        this.zoneManager.activateZone(zone.id);
        
        // Call optional callback immediately
        if (this.onZoneActivated) {
            this.onZoneActivated(zone.id);
        }
        
        // Play sound asynchronously (don't await - fire and forget for lowest latency)
        this.audioManager.playSound(zone.soundFile).catch(error => {
            console.error(`Failed to play sound for zone ${zone.id}:`, error);
            // Don't block UI - allow retry on next interaction
        });
    }
}
