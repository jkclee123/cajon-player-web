/**
 * Zone Configuration - Defines all sound zones, coordinates, and keyboard mappings
 * This is the central configuration for all trigger zones
 */

const ZONE_CONFIG = [
    {
        id: "kick",
        name: "Kick",
        soundFile: "src/assets/sounds/kick.mp3",
        volume: 1,
        keyboardKey: ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
        coordinates: { x: 0, y: 0, width: 100, height: 100 }
    },
    {
        id: "snare",
        name: "Snare",
        soundFile: "src/assets/sounds/snare.mp3",
        volume: 1,
        keyboardKey: ["z", "x", "c", "v", "b", "n", "m", ","],
        coordinates: { x: 42, y: 80, width: 16, height: 20 }
    },
    {
        id: "snare-quiet",
        name: "Snare Quiet",
        soundFile: "src/assets/sounds/snare.mp3",
        volume: 0.3,
        keyboardKey: ["a", "s", "d", "f", "g", "h", "j", "k"],
        coordinates: { x: 42, y: 80, width: 16, height: 20 }
    }
];

// Extract unique sound files for AudioManager
const SOUND_FILES = [...new Set(ZONE_CONFIG.map(zone => zone.soundFile))];

