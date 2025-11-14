/**
 * AudioManager - Handles audio loading, preloading, and playback
 * Uses HTML5 Audio API with pre-loaded pools for low-latency playback
 */

class AudioManager {
    constructor(config) {
        this.sounds = config.sounds || [];
        this.poolSize = config.poolSize || 3;
        this.audioPools = new Map(); // Map<soundPath, Array<Audio>>
        this.loadedSounds = new Set();
        this.loadErrors = new Map(); // Map<soundPath, Error>
        this.listeners = {
            loading: [],
            progress: [],
            loaded: [],
            error: []
        };
    }

    /**
     * Preloads all audio files
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
     * Loads a single sound file and creates audio pool
     * @private
     */
    async _loadSound(soundPath) {
        return new Promise((resolve, reject) => {
            const audioPool = [];
            let loadedCount = 0;
            let errorCount = 0;

            // Create pool of Audio instances
            for (let i = 0; i < this.poolSize; i++) {
                const audio = new Audio(soundPath);
                audio.preload = 'auto';

                audio.addEventListener('canplaythrough', () => {
                    loadedCount++;
                    if (loadedCount === this.poolSize && errorCount === 0) {
                        this.loadedSounds.add(soundPath);
                        this.audioPools.set(soundPath, audioPool);
                        this.emit('progress', {
                            loaded: this.loadedSounds.size,
                            total: this.sounds.length
                        });
                        resolve();
                    }
                });

                audio.addEventListener('error', (e) => {
                    errorCount++;
                    const error = new Error(`Failed to load sound: ${soundPath}`);
                    error.originalError = e;
                    this.loadErrors.set(soundPath, error);
                    
                    if (errorCount === this.poolSize) {
                        this.emit('error', error);
                        // Don't reject - allow partial functionality
                        resolve();
                    } else if (loadedCount + errorCount === this.poolSize) {
                        // Some instances loaded, some failed
                        if (audioPool.length > 0) {
                            this.loadedSounds.add(soundPath);
                            this.audioPools.set(soundPath, audioPool);
                            this.emit('progress', {
                                loaded: this.loadedSounds.size,
                                total: this.sounds.length
                            });
                        }
                        resolve();
                    }
                });

                audioPool.push(audio);
                audio.load();
            }
        });
    }

    /**
     * Plays a sound from the specified path
     * @param {string} soundPath - Path to the sound file
     * @returns {Promise<void>}
     */
    async playSound(soundPath) {
        if (!this.audioPools.has(soundPath)) {
            throw new Error(`Sound file not found: ${soundPath}`);
        }

        if (!this.isSoundLoaded(soundPath)) {
            throw new Error(`Sound not yet loaded: ${soundPath}`);
        }

        const pool = this.audioPools.get(soundPath);
        
        // Find an available Audio instance (not currently playing)
        let audio = pool.find(a => a.paused || a.ended);
        
        // If all are playing, use the first one (will restart)
        if (!audio) {
            audio = pool[0];
        }

        try {
            // Reset to start if already played
            if (!audio.paused && !audio.ended) {
                audio.currentTime = 0;
            }
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                await playPromise;
            }
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

