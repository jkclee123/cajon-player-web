/**
 * Zone Configuration - Defines all sound zones, coordinates, and keyboard mappings
 * This is the central configuration for all trigger zones
 */

const ZONE_CONFIG = [
    // Kick zones
    {
        id: "kick-center",
        name: "Kick Center",
        soundFile: "src/assets/sounds/cajon-off-kick-4.mp3",
        keyboardKey: "q",
        coordinates: { x: 40, y: 60, width: 20, height: 30 }
    },
    {
        id: "kick-damp-1",
        name: "Kick Damp 1",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-3.mp3",
        keyboardKey: "a",
        coordinates: { x: 35, y: 65, width: 15, height: 20 }
    },
    {
        id: "kick-damp-2",
        name: "Kick Damp 2",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-4.mp3",
        keyboardKey: "s",
        coordinates: { x: 50, y: 65, width: 15, height: 20 }
    },
    {
        id: "kick-damp-on-1",
        name: "Kick Damp On 1",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-3.mp3",
        keyboardKey: "z",
        coordinates: { x: 30, y: 70, width: 12, height: 15 }
    },
    {
        id: "kick-damp-on-2",
        name: "Kick Damp On 2",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-4.mp3",
        keyboardKey: "x",
        coordinates: { x: 58, y: 70, width: 12, height: 15 }
    },
    
    // Snare zones
    {
        id: "snare-left",
        name: "Snare Left",
        soundFile: "src/assets/sounds/cajon-off-snare-1.mp3",
        keyboardKey: "w",
        coordinates: { x: 20, y: 30, width: 25, height: 25 }
    },
    {
        id: "snare-right",
        name: "Snare Right",
        soundFile: "src/assets/sounds/cajon-off-snare-2.mp3",
        keyboardKey: "e",
        coordinates: { x: 55, y: 30, width: 25, height: 25 }
    },
    {
        id: "snare-on-1",
        name: "Snare On 1",
        soundFile: "src/assets/sounds/cajon-on-snare-2.mp3",
        keyboardKey: "r",
        coordinates: { x: 15, y: 25, width: 20, height: 20 }
    },
    {
        id: "snare-on-2",
        name: "Snare On 2",
        soundFile: "src/assets/sounds/cajon-on-snare-3.mp3",
        keyboardKey: "t",
        coordinates: { x: 40, y: 25, width: 20, height: 20 }
    },
    {
        id: "snare-on-3",
        name: "Snare On 3",
        soundFile: "src/assets/sounds/cajon-on-snare-4.mp3",
        keyboardKey: "y",
        coordinates: { x: 65, y: 25, width: 20, height: 20 }
    },
    
    // Roll zones
    {
        id: "snare-roll-fast",
        name: "Snare Roll Fast",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-fast-2.mp3",
        keyboardKey: "f",
        coordinates: { x: 25, y: 35, width: 15, height: 15 }
    },
    {
        id: "snare-roll-slow-1",
        name: "Snare Roll Slow 1",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-3.mp3",
        keyboardKey: "g",
        coordinates: { x: 45, y: 35, width: 15, height: 15 }
    },
    {
        id: "snare-roll-slow-2",
        name: "Snare Roll Slow 2",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-4.mp3",
        keyboardKey: "h",
        coordinates: { x: 60, y: 35, width: 15, height: 15 }
    },
    {
        id: "snare-roll-on",
        name: "Snare Roll On",
        soundFile: "src/assets/sounds/cajon-on-snare-roll-5.mp3",
        keyboardKey: "u",
        coordinates: { x: 42, y: 32, width: 16, height: 16 }
    }
];

// Extract unique sound files for AudioManager
const SOUND_FILES = [...new Set(ZONE_CONFIG.map(zone => zone.soundFile))];

