/**
 * Zone Configuration - Defines all sound zones, coordinates, and keyboard mappings
 * This is the central configuration for all trigger zones
 */

const ZONE_CONFIG = [
    // Kick zones - reorganized to avoid overlaps
    {
        id: "kick-center",
        name: "Kick Center",
        soundFile: "src/assets/sounds/cajon-off-kick-4.mp3",
        keyboardKey: "q",
        coordinates: { x: 40, y: 55, width: 20, height: 25 }
    },
    {
        id: "kick-damp-1",
        name: "Kick Damp 1",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-3.mp3",
        keyboardKey: "a",
        coordinates: { x: 30, y: 65, width: 15, height: 18 }
    },
    {
        id: "kick-damp-2",
        name: "Kick Damp 2",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-4.mp3",
        keyboardKey: "s",
        coordinates: { x: 55, y: 65, width: 15, height: 18 }
    },
    {
        id: "kick-damp-on-1",
        name: "Kick Damp On 1",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-3.mp3",
        keyboardKey: "z",
        coordinates: { x: 25, y: 75, width: 12, height: 12 }
    },
    {
        id: "kick-damp-on-2",
        name: "Kick Damp On 2",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-4.mp3",
        keyboardKey: "x",
        coordinates: { x: 63, y: 75, width: 12, height: 12 }
    },
    
    // Snare zones - reorganized to avoid overlaps
    {
        id: "snare-left",
        name: "Snare Left",
        soundFile: "src/assets/sounds/cajon-off-snare-1.mp3",
        keyboardKey: "w",
        coordinates: { x: 15, y: 20, width: 22, height: 22 }
    },
    {
        id: "snare-right",
        name: "Snare Right",
        soundFile: "src/assets/sounds/cajon-off-snare-2.mp3",
        keyboardKey: "e",
        coordinates: { x: 63, y: 20, width: 22, height: 22 }
    },
    {
        id: "snare-on-1",
        name: "Snare On 1",
        soundFile: "src/assets/sounds/cajon-on-snare-2.mp3",
        keyboardKey: "r",
        coordinates: { x: 10, y: 15, width: 18, height: 18 }
    },
    {
        id: "snare-on-2",
        name: "Snare On 2",
        soundFile: "src/assets/sounds/cajon-on-snare-3.mp3",
        keyboardKey: "t",
        coordinates: { x: 41, y: 15, width: 18, height: 18 }
    },
    {
        id: "snare-on-3",
        name: "Snare On 3",
        soundFile: "src/assets/sounds/cajon-on-snare-4.mp3",
        keyboardKey: "y",
        coordinates: { x: 72, y: 15, width: 18, height: 18 }
    },
    
    // Roll zones - reorganized to avoid overlaps
    {
        id: "snare-roll-fast",
        name: "Snare Roll Fast",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-fast-2.mp3",
        keyboardKey: "f",
        coordinates: { x: 20, y: 40, width: 14, height: 14 }
    },
    {
        id: "snare-roll-slow-1",
        name: "Snare Roll Slow 1",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-3.mp3",
        keyboardKey: "g",
        coordinates: { x: 43, y: 40, width: 14, height: 14 }
    },
    {
        id: "snare-roll-slow-2",
        name: "Snare Roll Slow 2",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-4.mp3",
        keyboardKey: "h",
        coordinates: { x: 66, y: 40, width: 14, height: 14 }
    },
    {
        id: "snare-roll-on",
        name: "Snare Roll On",
        soundFile: "src/assets/sounds/cajon-on-snare-roll-5.mp3",
        keyboardKey: "u",
        coordinates: { x: 38, y: 28, width: 24, height: 10 }
    }
];

// Extract unique sound files for AudioManager
const SOUND_FILES = [...new Set(ZONE_CONFIG.map(zone => zone.soundFile))];

