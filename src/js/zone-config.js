/**
 * Zone Configuration - Defines all sound zones, coordinates, and keyboard mappings
 * This is the central configuration for all trigger zones
 */

const ZONE_CONFIG = [
    // Row 1: 3 zones (top row)
    {
        id: "snare-left",
        name: "Snare Left",
        soundFile: "src/assets/sounds/cajon-off-snare-1.mp3",
        keyboardKey: "w",
        coordinates: { x: 10, y: 5, width: 20, height: 20 }
    },
    {
        id: "snare-right",
        name: "Snare Right",
        soundFile: "src/assets/sounds/cajon-off-snare-2.mp3",
        keyboardKey: "e",
        coordinates: { x: 40, y: 5, width: 20, height: 20 }
    },
    {
        id: "snare-on-1",
        name: "Snare On 1",
        soundFile: "src/assets/sounds/cajon-on-snare-2.mp3",
        keyboardKey: "r",
        coordinates: { x: 70, y: 5, width: 20, height: 20 }
    },
    
    // Row 2: 4 zones
    {
        id: "snare-on-2",
        name: "Snare On 2",
        soundFile: "src/assets/sounds/cajon-on-snare-3.mp3",
        keyboardKey: "t",
        coordinates: { x: 4, y: 30, width: 20, height: 20 }
    },
    {
        id: "snare-on-3",
        name: "Snare On 3",
        soundFile: "src/assets/sounds/cajon-on-snare-4.mp3",
        keyboardKey: "y",
        coordinates: { x: 28, y: 30, width: 20, height: 20 }
    },
    {
        id: "snare-roll-fast",
        name: "Snare Roll Fast",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-fast-2.mp3",
        keyboardKey: "f",
        coordinates: { x: 52, y: 30, width: 20, height: 20 }
    },
    {
        id: "snare-roll-on",
        name: "Snare Roll On",
        soundFile: "src/assets/sounds/cajon-on-snare-roll-5.mp3",
        keyboardKey: "u",
        coordinates: { x: 76, y: 30, width: 20, height: 20 }
    },
    
    // Row 3: 4 zones
    {
        id: "snare-roll-slow-1",
        name: "Snare Roll Slow 1",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-3.mp3",
        keyboardKey: "g",
        coordinates: { x: 4, y: 55, width: 20, height: 20 }
    },
    {
        id: "snare-roll-slow-2",
        name: "Snare Roll Slow 2",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-4.mp3",
        keyboardKey: "h",
        coordinates: { x: 28, y: 55, width: 20, height: 20 }
    },
    {
        id: "kick-center",
        name: "Kick Center",
        soundFile: "src/assets/sounds/cajon-off-kick-4.mp3",
        keyboardKey: "q",
        coordinates: { x: 52, y: 55, width: 20, height: 20 }
    },
    {
        id: "kick-damp-1",
        name: "Kick Damp 1",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-3.mp3",
        keyboardKey: "a",
        coordinates: { x: 76, y: 55, width: 20, height: 20 }
    },
    
    // Row 4: 3 zones (bottom row)
    {
        id: "kick-damp-2",
        name: "Kick Damp 2",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-4.mp3",
        keyboardKey: "s",
        coordinates: { x: 10, y: 80, width: 20, height: 20 }
    },
    {
        id: "kick-damp-on-1",
        name: "Kick Damp On 1",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-3.mp3",
        keyboardKey: "z",
        coordinates: { x: 40, y: 80, width: 20, height: 20 }
    },
    {
        id: "kick-damp-on-2",
        name: "Kick Damp On 2",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-4.mp3",
        keyboardKey: "x",
        coordinates: { x: 70, y: 80, width: 20, height: 20 }
    }
];

// Extract unique sound files for AudioManager
const SOUND_FILES = [...new Set(ZONE_CONFIG.map(zone => zone.soundFile))];

