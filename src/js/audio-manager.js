/**
 * AudioManager - Handles audio loading, preloading, and playback
 * Uses Web Audio API with AudioContext for ultra-low latency playback on mobile
 */

class AudioManager {
    constructor(config) {
        this.sounds = config.sounds || [];
        this.poolSize = config.poolSize || 6; // Increased pool size for fast rolls
        
        // Web Audio API setup
        this.audioContext = null;
        this.audioBuffers = new Map(); // Map<soundPath, AudioBuffer>
        this.loadedSounds = new Set();
        this.loadErrors = new Map(); // Map<soundPath, Error>
        this.sourceNodes = new Map(); // Map<soundPath, Array<AudioBufferSourceNode>>
        this.isContextUnlocked = false;
        
        this.listeners = {
            loading: [],
            progress: [],
            loaded: [],
            error: []
        };
        
        // Initialize audio context (will be unlocked on first user interaction)
        this._initAudioContext();
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
     * Unlocks/resumes the audio context (call on first user interaction)
     * @returns {Promise<void>}
     */
    async unlockAudioContext() {
        if (this.isContextUnlocked) {
            if (window.DebugLogger) {
                window.DebugLogger.log('unlockAudioContext: already unlocked, state=', this.audioContext && this.audioContext.state);
            }
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            try {
                if (window.DebugLogger) {
                    window.DebugLogger.log('unlockAudioContext: resuming AudioContext from suspended...');
                }
                await this.audioContext.resume();
                this.isContextUnlocked = true;
                if (window.DebugLogger) {
                    window.DebugLogger.log('unlockAudioContext: resumed. state=', this.audioContext.state);
                }
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                if (window.DebugLogger) {
                    window.DebugLogger.error('Failed to resume audio context:', error && (error.message || error));
                }
            }
        } else {
            this.isContextUnlocked = true;
            if (window.DebugLogger) {
                window.DebugLogger.log('unlockAudioContext: context not suspended. state=', this.audioContext.state);
            }
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
            
            // Pre-create source node pool for this sound
            this.sourceNodes.set(soundPath, []);
            
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

        // Ensure audio context is unlocked
        // Note: On first tap, unlock should already be completed by InputHandler before calling playSound
        // This check is a safety net for edge cases
        if (!this.isContextUnlocked) {
            if (window.DebugLogger) {
                window.DebugLogger.log('playSound: context locked, unlocking before play. state=', this.audioContext && this.audioContext.state, 'WARNING: unlock should happen in gesture handler');
            }
            await this.unlockAudioContext();
        }
        
        // Double-check context state before creating source node
        if (this.audioContext.state === 'suspended') {
            if (window.DebugLogger) {
                window.DebugLogger.log('playSound: context still suspended after unlock attempt, forcing resume. state=', this.audioContext.state);
            }
            try {
                await this.audioContext.resume();
            } catch (err) {
                if (window.DebugLogger) {
                    window.DebugLogger.error('playSound: failed to resume context', err && (err.message || err));
                }
                throw new Error('AudioContext is suspended and cannot be resumed');
            }
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
