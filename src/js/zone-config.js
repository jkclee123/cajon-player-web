/**
 * Zone Configuration - Defines all sound zones, coordinates, and keyboard mappings
 * This is the central configuration for all trigger zones
 */

const ZONE_CONFIG = [
    // Row 1: 2 zones (top row) - Basic snare hits (off wires) - Wider zones with spacing, centered
    {
        id: "snare-left",
        name: "Snare Left",
        soundFile: "src/assets/sounds/cajon-off-snare-1.mp3",
        keyboardKey: ["`","1", "2", "3", "4", "5", "6"],
        coordinates: { x: 7, y: 5, width: 40, height: 20 }
    },
    {
        id: "snare-right",
        name: "Snare Right",
        soundFile: "src/assets/sounds/cajon-off-snare-2.mp3",
        keyboardKey: ["7", "8", "9", "0", "-", "+", "backspace", "delete"],
        coordinates: { x: 53, y: 5, width: 40, height: 20 }
    },
    
    // Row 2: 3 zones - Snare with wires on - Medium width zones with spacing, centered
    {
        id: "snare-on-1",
        name: "Snare On 1",
        soundFile: "src/assets/sounds/cajon-on-snare-2.mp3",
        keyboardKey: ["tab", "q", "w", "e"],
        coordinates: { x: 7, y: 30, width: 27, height: 20 }
    },
    {
        id: "snare-on-2",
        name: "Snare On 2",
        soundFile: "src/assets/sounds/cajon-on-snare-3.mp3",
        keyboardKey: ["r", "t", "y", "u", "i"],
        coordinates: { x: 37, y: 30, width: 27, height: 20 }
    },
    {
        id: "snare-on-3",
        name: "Snare On 3",
        soundFile: "src/assets/sounds/cajon-on-snare-4.mp3",
        keyboardKey: ["o", "p", "[", "]", "\\"],
        coordinates: { x: 67, y: 30, width: 27, height: 20 }
    },
    
    // Row 3: 4 zones - All snare rolls - Thinner zones with spacing, centered
    {
        id: "snare-roll-slow-1",
        name: "Snare Roll Slow 1",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-3.mp3",
        keyboardKey: ["a", "s", "d"],
        coordinates: { x: 7, y: 55, width: 20, height: 20 }
    },
    {
        id: "snare-roll-slow-2",
        name: "Snare Roll Slow 2",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-slow-4.mp3",
        keyboardKey: ["f", "g", "h"],
        coordinates: { x: 29, y: 55, width: 20, height: 20 }
    },
    {
        id: "snare-roll-fast",
        name: "Snare Roll Fast",
        soundFile: "src/assets/sounds/cajon-off-snare-roll-fast-2.mp3",
        keyboardKey: ["j", "k", "l"],
        coordinates: { x: 52, y: 55, width: 20, height: 20 }
    },
    {
        id: "snare-roll-on",
        name: "Snare Roll On",
        soundFile: "src/assets/sounds/cajon-on-snare-roll-5.mp3",
        keyboardKey: [";", "'", "enter"],
        coordinates: { x: 73, y: 55, width: 20, height: 20 }
    },
    
    // Row 4: 5 zones (bottom row) - All kicks - Thinnest zones with spacing, centered
    {
        id: "kick-damp-1",
        name: "Kick Damp 1",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-3.mp3",
        keyboardKey: ["leftshift", "z", "x"],
        coordinates: { x: 7, y: 80, width: 16, height: 20 }
    },
    {
        id: "kick-damp-2",
        name: "Kick Damp 2",
        soundFile: "src/assets/sounds/cajon-off-kick-damp-4.mp3",
        keyboardKey: ["c", "v", "b"],
        coordinates: { x: 24.5, y: 80, width: 16, height: 20 }
    },
    {
        id: "kick-center",
        name: "Kick Center",
        soundFile: "src/assets/sounds/cajon-off-kick-4.mp3",
        keyboardKey: [" "],
        coordinates: { x: 42, y: 80, width: 16, height: 20 }
    },
    {
        id: "kick-damp-on-1",
        name: "Kick Damp On 1",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-3.mp3",
        keyboardKey: ["n", "m", ","],
        coordinates: { x: 59.5, y: 80, width: 16, height: 20 }
    },
    {
        id: "kick-damp-on-2",
        name: "Kick Damp On 2",
        soundFile: "src/assets/sounds/cajon-on-kick-damp-4.mp3",
        keyboardKey: [".", "/", "rightshift"],
        coordinates: { x: 77, y: 80, width: 16, height: 20 }
    }
];

// Extract unique sound files for AudioManager
const SOUND_FILES = [...new Set(ZONE_CONFIG.map(zone => zone.soundFile))];

