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
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            throw error;
        }
    }

    /**
     * Unlocks/resumes the audio context (call on first user interaction)
     * @returns {Promise<void>}
     */
    async unlockAudioContext() {
        if (this.isContextUnlocked) {
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                this.isContextUnlocked = true;
            } catch (error) {
                console.error('Failed to resume audio context:', error);
            }
        } else {
            this.isContextUnlocked = true;
        }
    }

    /**
     * Preloads all audio files using fetch and decodeAudioData
     * @returns {Promise<void>}
     */
    async preloadAll() {
        this.emit('loading');
        
        const loadPromises = this.sounds.map(soundPath => this._loadSound(soundPath));
        
        try {
            await Promise.allSettled(loadPromises);
            this.emit('loaded');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Loads a single sound file and decodes it to AudioBuffer
     * @private
     */
    async _loadSound(soundPath) {
        try {
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
        } catch (error) {
            const loadError = new Error(`Failed to load sound: ${soundPath}`);
            loadError.originalError = error;
            this.loadErrors.set(soundPath, loadError);
            this.emit('error', loadError);
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
        if (!this.isContextUnlocked) {
            await this.unlockAudioContext();
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
            sourceNode.start(0);
        } catch (error) {
            const playbackError = new Error(`Failed to play sound: ${soundPath}`);
            playbackError.originalError = error;
            this.emit('error', playbackError);
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
