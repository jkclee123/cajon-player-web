/**
 * Zone Configuration - Defines all sound zones, coordinates, and keyboard mappings
 * This is the central configuration for all trigger zones
 */

const ZONE_CONFIG = [
    {
        id: "kick",
        name: "Kick",
        soundFile: "src/assets/sounds/kick.mp3",
        volume: 1.5,
        keyboardKey: ["r", "u", "ArrowDown"],
        coordinates: { x: 0, y: 0, width: 50, height: 30 }
    },
    {
        id: "cymbal",
        name: "Cymbal",
        soundFile: "src/assets/sounds/cymbal.mp3",
        volume: 1.2,
        keyboardKey: [" ", "Enter", "ArrowUp"],
        coordinates: { x: 50, y: 0, width: 50, height: 30 }
    },
    {
        id: "snare",
        name: "Snare",
        soundFile: "src/assets/sounds/snare.mp3",
        volume: 1.2,
        keyboardKey: ["e", "i", "ArrowLeft"],
        coordinates: { x: 0, y: 70, width: 50, height: 30 }
    },
    {
        id: "snare-quiet",
        name: "Snare Quiet",
        soundFile: "src/assets/sounds/snare.mp3",
        volume: 0.3,
        keyboardKey: ["w", "o", "ArrowRight"],
        coordinates: { x: 50, y: 70, width: 50, height: 30 }
    }
];

// Extract unique sound files for AudioManager
const SOUND_FILES = [...new Set(ZONE_CONFIG.map(zone => zone.soundFile))];

