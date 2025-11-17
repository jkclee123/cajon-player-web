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
        
        if (window.DebugLogger) {
            window.DebugLogger.log('InputHandler.initialize: binding events on container=', this.container && this.container.id);
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
    async handlePointerDown(event) {
        if (!this.enabled) return;
        
        // Find zone first (before async operations)
        let zone = null;
        let clickedElement = event.target;
        let zoneElement = null;
        
        if (window.DebugLogger) {
            try {
                window.DebugLogger.log('handlePointerDown: target=', clickedElement && (clickedElement.className || clickedElement.id || clickedElement.tagName));
            } catch (_) {}
        }
        
        // Check if clicked element is a keyboard-key-item
        let isKeyboardKeyItem = false;
        while (clickedElement && clickedElement !== document.body) {
            if (clickedElement.classList && clickedElement.classList.contains('keyboard-key-item')) {
                const zoneId = clickedElement.dataset.zoneId;
                if (zoneId) {
                    zone = this.zoneManager.getZoneById(zoneId);
                    if (zone) {
                        isKeyboardKeyItem = true;
                        event.preventDefault();
                        event.stopPropagation();
                        if (window.DebugLogger) {
                            window.DebugLogger.log('handlePointerDown: keyboard-key-item -> zone', zone.id);
                        }
                        break;
                    }
                }
            }
            clickedElement = clickedElement.parentElement;
        }
        
        // Otherwise, check for trigger zone element
        if (!zone) {
            zone = this.zoneManager.getZoneByElement(event.target);
            if (zone) {
                // Find the actual zone DOM element
                zoneElement = this.zoneManager.zoneElements.get(zone.id);
                event.preventDefault();
                event.stopPropagation();
                if (window.DebugLogger) {
                    window.DebugLogger.log('handlePointerDown: trigger zone found', zone.id);
                }
            } else {
                if (window.DebugLogger) {
                    window.DebugLogger.log('handlePointerDown: no trigger zone found for target');
                }
                return; // No zone found, exit early
            }
        } else {
            // For keyboard-key-item clicks, find the zone element
            zoneElement = this.zoneManager.zoneElements.get(zone.id);
        }
        
        // Calculate volume based on click position within zone
        // For keyboard-key-item clicks, use center volume (1.0) since click is not on zone element
        let volume = zone.volume !== undefined ? zone.volume : 1.0;
        if (zoneElement && !isKeyboardKeyItem) {
            volume = this._calculateVolumeFromClickPosition(event, zoneElement, zone);
        } else if (isKeyboardKeyItem) {
            // For keyboard-key-item clicks, use center volume (1.0) multiplied by zone base volume
            const baseVolume = zone.volume !== undefined ? zone.volume : 1.0;
            volume = 1.0 * baseVolume;
        }
        
        // CRITICAL: Unlock audio context BEFORE playing sound, but within the same gesture handler
        // On iOS Safari, both resume() and start() must be called synchronously within user gesture
        if (!this.audioUnlocked && this.audioManager) {
            if (window.DebugLogger) {
                window.DebugLogger.log('handlePointerDown: requesting unlock. ctxState=', this.audioManager.audioContext && this.audioManager.audioContext.state, 'pointerType=', event.pointerType);
            }
            try {
                // AWAIT the unlock to ensure it completes before playSound is called
                await this.audioManager.unlockAudioContext({ fromGesture: true });
                this.audioUnlocked = true;
                if (window.DebugLogger) {
                    window.DebugLogger.log('handlePointerDown: unlock completed. ctxState=', this.audioManager.audioContext && this.audioManager.audioContext.state);
                }
            } catch (err) {
                console.error('Failed to unlock audio context:', err);
                if (window.DebugLogger) {
                    window.DebugLogger.error('handlePointerDown: unlock failed', err && (err.message || err));
                }
                // Still set flag to prevent retry loops
                this.audioUnlocked = true;
            }
        }
        
        // Now trigger zone - unlock is complete, so playSound should work
        if (zone) {
            await this._triggerZone(zone, volume);
        }
    }

    /**
     * Handles keyboard keydown events
     * @param {KeyboardEvent} event
     */
    async handleKeydown(event) {
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
        
        if (!zone) {
            if (window.DebugLogger) {
                window.DebugLogger.log('handleKeydown: no zone for key', keyToCheck);
            }
            return;
        }
        
        event.preventDefault();
        event.stopPropagation();
        if (window.DebugLogger) {
            window.DebugLogger.log('handleKeydown: zone found', zone.id, 'for key', keyToCheck);
        }
        
        // CRITICAL: Unlock audio context BEFORE playing sound, but within the same gesture handler
        if (!this.audioUnlocked && this.audioManager) {
            try {
                await this.audioManager.unlockAudioContext({ fromGesture: true });
                this.audioUnlocked = true;
                if (window.DebugLogger) {
                    window.DebugLogger.log('handleKeydown: unlock completed. ctxState=', this.audioManager.audioContext && this.audioManager.audioContext.state, 'key=', event.key, 'code=', event.code);
                }
            } catch (err) {
                console.error('Failed to unlock audio context:', err);
                if (window.DebugLogger) {
                    window.DebugLogger.error('handleKeydown: unlock failed', err && (err.message || err));
                }
                // Still set flag to prevent retry loops
                this.audioUnlocked = true;
            }
        }
        
        // Now trigger zone - unlock is complete, so playSound should work
        await this._triggerZone(zone);
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
     * Calculates volume based on click position within zone
     * Center = 100% volume, Edge = 40% volume, linear interpolation
     * @param {PointerEvent} event - The pointer event
     * @param {HTMLElement} zoneElement - The zone DOM element
     * @param {Object} zone - The zone configuration
     * @returns {number} Volume multiplier (0.4 to 1.0)
     * @private
     */
    _calculateVolumeFromClickPosition(event, zoneElement, zone) {
        if (!zoneElement) {
            return zone.volume !== undefined ? zone.volume : 1.0;
        }
        
        // Get zone element's bounding rectangle
        const rect = zoneElement.getBoundingClientRect();
        
        // Calculate click position relative to zone element
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Calculate zone center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate distance from click to center
        const dx = clickX - centerX;
        const dy = clickY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate maximum distance (from center to corner)
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        
        // If maxDistance is 0 (shouldn't happen), return default volume
        if (maxDistance === 0) {
            return zone.volume !== undefined ? zone.volume : 1.0;
        }
        
        // Calculate normalized distance (0 = center, 1 = edge)
        const normalizedDistance = Math.min(distance / maxDistance, 1.0);
        
        // Linear interpolation: volume = 0.4 + 0.6 * (1 - normalizedDistance)
        // Center (normalizedDistance = 0): volume = 0.4 + 0.6 * 1 = 1.0
        // Edge (normalizedDistance = 1): volume = 0.4 + 0.6 * 0 = 0.4
        const volume = 0 + 1 * (1 - normalizedDistance);
        
        // Apply zone's base volume multiplier if specified
        const baseVolume = zone.volume !== undefined ? zone.volume : 1.0;
        const finalVolume = volume * baseVolume;
        
        if (window.DebugLogger) {
            window.DebugLogger.log('_calculateVolumeFromClickPosition:', {
                zoneId: zone.id,
                clickX: clickX.toFixed(1),
                clickY: clickY.toFixed(1),
                centerX: centerX.toFixed(1),
                centerY: centerY.toFixed(1),
                distance: distance.toFixed(1),
                maxDistance: maxDistance.toFixed(1),
                normalizedDistance: normalizedDistance.toFixed(2),
                volume: volume.toFixed(2),
                baseVolume: baseVolume,
                finalVolume: finalVolume.toFixed(2)
            });
        }
        
        return finalVolume;
    }

    /**
     * Triggers a zone (plays sound and activates visual feedback)
     * Visual feedback is triggered IMMEDIATELY, audio plays after unlock completes
     * @param {Object} zone - Zone configuration
     * @param {number} volume - Volume multiplier (optional, defaults to zone.volume or 1.0)
     * @private
     */
    async _triggerZone(zone, volume = null) {
        // Activate visual feedback IMMEDIATELY (before audio)
        this.zoneManager.activateZone(zone.id);
        
        // Call optional callback immediately
        if (this.onZoneActivated) {
            this.onZoneActivated(zone.id);
        }
        
        // Use provided volume, or fall back to zone volume, or default to 1.0
        const finalVolume = volume !== null ? volume : (zone.volume !== undefined ? zone.volume : 1.0);
        if (window.DebugLogger) {
            window.DebugLogger.log('_triggerZone: play', zone.id, '->', zone.soundFile, 'volume=', finalVolume);
        }
        try {
            await this.audioManager.playSound(zone.soundFile, finalVolume);
        } catch (error) {
            console.error(`Failed to play sound for zone ${zone.id}:`, error);
            if (window.DebugLogger) {
                window.DebugLogger.error('_triggerZone: failed play for zone', zone && zone.id, error && (error.message || error));
            }
            // Don't block UI - allow retry on next interaction
        }
    }
}
