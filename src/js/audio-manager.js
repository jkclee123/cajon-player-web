/**
 * AudioManager - Handles audio loading, preloading, and playback
 * Uses Web Audio API with AudioContext for ultra-low latency playback on mobile
 */

class AudioManager {
    constructor(config) {
        this.sounds = config.sounds || [];
        
        // Web Audio API setup
        this.audioContext = null;
        this.audioBuffers = new Map(); // Map<soundPath, AudioBuffer>
        this.loadedSounds = new Set();
        this.loadErrors = new Map(); // Map<soundPath, Error>
        this.isContextUnlocked = false;
        this._unlockPromise = null;
        this._autoUnlockAttached = false;
        this._gestureUnlockHandler = null;
        this._gestureUnlockEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown'];
        this._scratchBuffer = null;
        
        this.listeners = {
            loading: [],
            progress: [],
            loaded: [],
            error: []
        };
        
        // Initialize audio context (will be unlocked on first user interaction)
        this._initAudioContext();
        this._setupGestureUnlock();
    }

    /**
     * Initializes the Web Audio API context
     * @private
     */
    _initAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error('Web Audio API not supported');
            }
            
            // Use 'interactive' latency hint for low-latency playback
            this.audioContext = new AudioContextClass({
                latencyHint: 'interactive',
                sampleRate: 44100 // Standard sample rate
            });
            if (window.DebugLogger) {
                window.DebugLogger.log('AudioContext created. state=', this.audioContext.state, 'sampleRate=', this.audioContext.sampleRate);
            }
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('Failed to initialize AudioContext:', error && (error.message || error));
            }
            throw error;
        }
    }

    /**
     * Registers global gesture listeners to auto-unlock the AudioContext on first interaction
     * @private
     */
    _setupGestureUnlock() {
        if (!this.audioContext || this._autoUnlockAttached) {
            return;
        }
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }
        this._gestureUnlockHandler = this._handleGestureUnlockEvent.bind(this);
        this._gestureUnlockEvents.forEach(eventName => {
            window.addEventListener(eventName, this._gestureUnlockHandler, { capture: true, passive: true });
        });
        this._autoUnlockAttached = true;
    }

    /**
     * Removes global gesture listeners once the context has been unlocked
     * @private
     */
    _removeGestureUnlockListeners() {
        if (!this._autoUnlockAttached || !this._gestureUnlockHandler) {
            return;
        }
        this._gestureUnlockEvents.forEach(eventName => {
            window.removeEventListener(eventName, this._gestureUnlockHandler, true);
        });
        this._autoUnlockAttached = false;
        this._gestureUnlockHandler = null;
    }

    /**
     * Handles the first qualifying user gesture to trigger the unlock routine
     * @param {Event} event
     * @private
     */
    _handleGestureUnlockEvent(event) {
        if (this.isContextUnlocked || !this.audioContext) {
            this._removeGestureUnlockListeners();
            return;
        }
        if (window.DebugLogger) {
            window.DebugLogger.log('AudioManager: auto gesture unlock attempt via', event && event.type);
        }
        this.unlockAudioContext({ fromGesture: true }).catch(error => {
            console.error('AudioManager: auto unlock failed', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('AudioManager auto unlock failed', error && (error.message || error));
            }
        });
    }

    /**
     * Creates and starts a silent buffer to prime iOS audio restrictions
     * Must be called directly within the user gesture stack.
     * @private
     */
    _primeAudioContext() {
        if (!this.audioContext) {
            return;
        }
        if (!this._scratchBuffer) {
            const sampleRate = this.audioContext.sampleRate || 44100;
            this._scratchBuffer = this.audioContext.createBuffer(1, 1, sampleRate);
        }
        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = this._scratchBuffer;
        let gainNode = null;
        if (typeof this.audioContext.createGain === 'function') {
            gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            sourceNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
        } else {
            sourceNode.connect(this.audioContext.destination);
        }
        sourceNode.onended = () => {
            try {
                sourceNode.disconnect();
                if (gainNode) {
                    gainNode.disconnect();
                }
            } catch (_) {
                // Ignore cleanup errors
            }
        };
        try {
            sourceNode.start(0);
        } catch (error) {
            if (window.DebugLogger) {
                window.DebugLogger.error('AudioManager: primeAudioContext start failed', error && (error.message || error));
            }
        }
    }

    /**
     * Unlocks/resumes the audio context (call on first user interaction)
     * @returns {Promise<void>}
     */
    async unlockAudioContext(options = {}) {
        const { fromGesture = false } = options;
        if (!this.audioContext) {
            throw new Error('AudioContext not initialized');
        }
        if (this.isContextUnlocked) {
            if (window.DebugLogger) {
                window.DebugLogger.log('unlockAudioContext: already unlocked, state=', this.audioContext && this.audioContext.state);
            }
            return;
        }
        
        const needsResume = this.audioContext.state === 'suspended' || this.audioContext.state === 'interrupted';
        
        if (needsResume) {
            if (fromGesture) {
                this._primeAudioContext();
            }
            if (window.DebugLogger) {
                window.DebugLogger.log('unlockAudioContext: attempting resume. state=', this.audioContext.state, 'fromGesture=', fromGesture);
            }
            try {
                if (!this._unlockPromise) {
                    this._unlockPromise = this.audioContext.resume();
                }
                if (this._unlockPromise && typeof this._unlockPromise.then === 'function') {
                    await this._unlockPromise;
                }
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                if (window.DebugLogger) {
                    window.DebugLogger.error('Failed to resume audio context:', error && (error.message || error));
                }
                this._unlockPromise = null;
                throw error;
            }
            this._unlockPromise = null;
        }
        
        this.isContextUnlocked = this.audioContext.state === 'running' || !needsResume;
        if (this.isContextUnlocked) {
            this._removeGestureUnlockListeners();
            if (window.DebugLogger) {
                window.DebugLogger.log('unlockAudioContext: context unlocked. state=', this.audioContext.state);
            }
        } else if (window.DebugLogger) {
            window.DebugLogger.warn && window.DebugLogger.warn('unlockAudioContext: context state after resume=', this.audioContext.state);
        }
    }

    /**
     * Preloads all audio files using fetch and decodeAudioData
     * @returns {Promise<void>}
     */
    async preloadAll() {
        if (window.DebugLogger) {
            window.DebugLogger.log('preloadAll: start. sounds=', this.sounds.length);
        }
        this.emit('loading');
        
        const loadPromises = this.sounds.map(soundPath => this._loadSound(soundPath));
        
        try {
            await Promise.allSettled(loadPromises);
            this.emit('loaded');
            if (window.DebugLogger) {
                window.DebugLogger.log('preloadAll: completed. loaded=', this.loadedSounds.size, 'errors=', this.loadErrors.size);
            }
        } catch (error) {
            this.emit('error', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('preloadAll: error', error && (error.message || error));
            }
            throw error;
        }
    }

    /**
     * Loads a single sound file and decodes it to AudioBuffer
     * @private
     */
    async _loadSound(soundPath) {
        try {
            if (window.DebugLogger) {
                window.DebugLogger.log('loadSound: fetching', soundPath);
            }
            // Fetch audio file
            const response = await fetch(soundPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch sound: ${soundPath} (${response.status})`);
            }
            
            // Decode audio data
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Store the buffer
            this.audioBuffers.set(soundPath, audioBuffer);
            this.loadedSounds.add(soundPath);
            
            this.emit('progress', {
                loaded: this.loadedSounds.size,
                total: this.sounds.length
            });
            if (window.DebugLogger) {
                window.DebugLogger.log('loadSound: decoded and stored', soundPath, 'duration=', audioBuffer && audioBuffer.duration);
            }
        } catch (error) {
            const loadError = new Error(`Failed to load sound: ${soundPath}`);
            loadError.originalError = error;
            this.loadErrors.set(soundPath, loadError);
            this.emit('error', loadError);
            if (window.DebugLogger) {
                window.DebugLogger.error('loadSound: error for', soundPath, error && (error.message || error));
            }
            // Don't throw - allow partial functionality
        }
    }

    /**
     * Plays a sound from the specified path
     * Uses AudioBufferSourceNode for instant playback
     * @param {string} soundPath - Path to the sound file
     * @returns {Promise<void>}
     */
    async playSound(soundPath) {
        if (!this.audioBuffers.has(soundPath)) {
            throw new Error(`Sound file not found: ${soundPath}`);
        }

        if (!this.isSoundLoaded(soundPath)) {
            throw new Error(`Sound not yet loaded: ${soundPath}`);
        }

        // Ensure audio context is unlocked and running
        // Note: On first tap, unlock should already be completed by InputHandler before calling playSound
        // This check is a safety net for edge cases (e.g., context suspended after tab backgrounding)
        if (!this.isContextUnlocked || this.audioContext.state === 'suspended') {
            if (window.DebugLogger) {
                window.DebugLogger.log('playSound: context needs unlock/resume. state=', this.audioContext.state, 'unlocked=', this.isContextUnlocked);
            }
            await this.unlockAudioContext({ fromGesture: false });
        }

        const audioBuffer = this.audioBuffers.get(soundPath);
        
        // Create a new source node for this playback
        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(this.audioContext.destination);
        
        // Clean up source node when playback ends
        sourceNode.onended = () => {
            // Source node is automatically disconnected when ended
        };
        
        try {
            // Start playback immediately (0 = now)
            if (window.DebugLogger) {
                window.DebugLogger.log('playSound: starting', soundPath, 'ctxState=', this.audioContext.state, 'unlocked=', this.isContextUnlocked);
            }
            sourceNode.start(0);
            if (window.DebugLogger) {
                window.DebugLogger.log('playSound: started', soundPath);
            }
        } catch (error) {
            const playbackError = new Error(`Failed to play sound: ${soundPath}`);
            playbackError.originalError = error;
            this.emit('error', playbackError);
            if (window.DebugLogger) {
                window.DebugLogger.error('playSound: error for', soundPath, error && (error.message || error));
            }
            throw playbackError;
        }
    }

    /**
     * Checks if a sound file has finished loading
     * @param {string} soundPath - Path to the sound file
     * @returns {boolean}
     */
    isSoundLoaded(soundPath) {
        return this.loadedSounds.has(soundPath);
    }

    /**
     * Gets the current loading progress
     * @returns {{loaded: number, total: number}}
     */
    getLoadingProgress() {
        return {
            loaded: this.loadedSounds.size,
            total: this.sounds.length
        };
    }

    /**
     * Event emitter methods
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }
}
