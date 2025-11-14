# Module Interfaces: Browser Cajon Player

**Date**: 2024-12-19  
**Feature**: Browser Cajon Player  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the internal JavaScript module interfaces (contracts) for the Browser Cajon Player application. Since this is a frontend-only application with no backend APIs, these contracts define the interfaces between JavaScript modules.

## Module: audio-manager.js

### Exports

#### `AudioManager` (Class)

Manages audio file loading, preloading, and playback.

**Constructor**:
```javascript
new AudioManager(config)
```

**Parameters**:
- `config` (object, required):
  - `sounds` (Array<string>, required): Array of sound file paths
  - `poolSize` (number, optional): Number of Audio instances per sound (default: 3)

**Methods**:

##### `preloadAll() → Promise<void>`

Preloads all audio files. Returns a Promise that resolves when all sounds are ready to play.

**Returns**: `Promise<void>` - Resolves when all sounds are loaded, rejects if critical sounds fail

**Events Emitted**:
- `loading` - Fired when loading starts
- `progress` - Fired with `{loaded: number, total: number}` as loading progresses
- `loaded` - Fired when all sounds are loaded
- `error` - Fired with `Error` object if loading fails

**Example**:
```javascript
const manager = new AudioManager({ sounds: ['sound1.mp3', 'sound2.mp3'] });
await manager.preloadAll();
```

##### `playSound(soundPath) → Promise<void>`

Plays a sound from the specified path. Uses audio pool for overlapping playback.

**Parameters**:
- `soundPath` (string, required): Path to the sound file

**Returns**: `Promise<void>` - Resolves when playback starts, rejects if playback fails

**Throws**: 
- `Error` if sound file not found
- `Error` if sound not yet loaded

**Example**:
```javascript
await manager.playSound('sounds/cajon-off-kick-4.mp3');
```

##### `isSoundLoaded(soundPath) → boolean`

Checks if a sound file has finished loading.

**Parameters**:
- `soundPath` (string, required): Path to the sound file

**Returns**: `boolean` - `true` if loaded, `false` otherwise

##### `getLoadingProgress() → {loaded: number, total: number}`

Gets the current loading progress.

**Returns**: Object with `loaded` (number of loaded sounds) and `total` (total number of sounds)

---

## Module: trigger-zones.js

### Exports

#### `TriggerZoneManager` (Class)

Manages trigger zone definitions, DOM element creation, and zone lookup.

**Constructor**:
```javascript
new TriggerZoneManager(config)
```

**Parameters**:
- `config` (object, required):
  - `zones` (Array<ZoneConfig>, required): Array of zone configuration objects
  - `container` (HTMLElement, required): Container element for zone elements
  - `cajonImage` (string, optional): Path to cajon image

**ZoneConfig Structure**:
```javascript
{
  id: string,              // Unique identifier
  name: string,            // Human-readable name
  soundFile: string,       // Path to sound file
  keyboardKey: string,     // Optional keyboard key
  coordinates: {           // Position and size
    x: number,             // X position (percentage)
    y: number,             // Y position (percentage)
    width: number,         // Width (percentage)
    height: number         // Height (percentage)
  }
}
```

**Methods**:

##### `initialize() → void`

Creates DOM elements for all trigger zones and adds them to the container.

**Side Effects**: Modifies DOM, creates zone elements

##### `getZoneById(id) → ZoneConfig | null`

Gets zone configuration by ID.

**Parameters**:
- `id` (string, required): Zone identifier

**Returns**: `ZoneConfig` object or `null` if not found

##### `getZoneByElement(element) → ZoneConfig | null`

Gets zone configuration by DOM element.

**Parameters**:
- `element` (HTMLElement, required): Zone DOM element

**Returns**: `ZoneConfig` object or `null` if not found

##### `getZoneByKey(key) → ZoneConfig | null`

Gets zone configuration by keyboard key.

**Parameters**:
- `key` (string, required): Keyboard key (e.g., "q", "w")

**Returns**: `ZoneConfig` object or `null` if not found

##### `getAllZones() → Array<ZoneConfig>`

Gets all zone configurations.

**Returns**: Array of `ZoneConfig` objects

##### `activateZone(zoneId) → void`

Activates visual feedback for a zone.

**Parameters**:
- `zoneId` (string, required): Zone identifier

**Side Effects**: Adds CSS class to zone element for visual feedback

---

## Module: input-handler.js

### Exports

#### `InputHandler` (Class)

Handles user input events (mouse, touch, keyboard) and coordinates with other modules.

**Constructor**:
```javascript
new InputHandler(config)
```

**Parameters**:
- `config` (object, required):
  - `zoneManager` (TriggerZoneManager, required): Instance of TriggerZoneManager
  - `audioManager` (AudioManager, required): Instance of AudioManager
  - `onZoneActivated` (function, optional): Callback when zone is activated
    - Signature: `(zoneId: string) => void`

**Methods**:

##### `initialize() → void`

Attaches event listeners for mouse, touch, and keyboard input.

**Side Effects**: Adds event listeners to DOM

##### `destroy() → void`

Removes all event listeners.

**Side Effects**: Removes event listeners from DOM

##### `enable() → void`

Enables input handling (allows interactions).

##### `disable() → void`

Disables input handling (prevents interactions).

**Events Handled**:
- `click` - Mouse clicks on trigger zones
- `touchstart` - Touch events on trigger zones
- `keydown` - Keyboard key presses
- `focus` - Window focus (enables keyboard)
- `blur` - Window blur (disables keyboard)

---

## Module: app.js

### Exports

#### `App` (Class)

Main application coordinator. Initializes all modules and manages application lifecycle.

**Constructor**:
```javascript
new App(config)
```

**Parameters**:
- `config` (object, required):
  - `zones` (Array<ZoneConfig>, required): Zone configurations
  - `sounds` (Array<string>, required): Sound file paths
  - `container` (HTMLElement, optional): App container (default: `document.getElementById('app')`)

**Methods**:

##### `init() → Promise<void>`

Initializes the application: creates managers, preloads sounds, sets up UI.

**Returns**: `Promise<void>` - Resolves when app is ready

**Side Effects**: 
- Creates DOM elements
- Preloads audio files
- Sets up event listeners
- Shows/hides loading indicator

##### `destroy() → void`

Cleans up the application: removes event listeners, clears resources.

**Side Effects**: Removes event listeners, clears DOM

**Properties** (read-only):

- `audioManager` (AudioManager): Audio manager instance
- `zoneManager` (TriggerZoneManager): Zone manager instance
- `inputHandler` (InputHandler): Input handler instance
- `isReady` (boolean): Whether app is ready for interaction

---

## Error Handling Contracts

### Audio Loading Errors

**Error Type**: `AudioLoadError`

**Properties**:
- `soundPath` (string): Path to failed sound file
- `originalError` (Error): Original error from Audio API

**Handling**: Log error, continue with other sounds, show user-friendly message

### Audio Playback Errors

**Error Type**: `AudioPlaybackError`

**Properties**:
- `soundPath` (string): Path to sound that failed to play
- `originalError` (Error): Original error from Audio API

**Handling**: Log error, allow retry on next interaction, don't block UI

### Zone Configuration Errors

**Error Type**: `ZoneConfigError`

**Properties**:
- `zoneId` (string): Zone identifier with error
- `message` (string): Error description

**Handling**: Log error, skip invalid zones, continue with valid zones

---

## Performance Contracts

### Audio Preloading

- **Contract**: All sounds must load within 3 seconds (standard broadband)
- **Measurement**: Time from `preloadAll()` call to `loaded` event
- **Failure**: Show error message, allow partial functionality

### Sound Trigger Latency

- **Contract**: Sound must start playing within 100ms of user interaction
- **Measurement**: Time from event (click/tap/keydown) to audio playback start
- **Failure**: Log warning, investigate audio pool or preloading

### Rapid Input Handling

- **Contract**: System must handle ≥5 actions per second without lag
- **Measurement**: Count successful triggers per second during rapid interaction
- **Failure**: Increase audio pool size or optimize event handling

---

## Browser Compatibility Contracts

### Required APIs

- HTML5 Audio API (`Audio` constructor, `play()` method)
- DOM API (`addEventListener`, `querySelector`, etc.)
- Touch Events API (`touchstart` event) - for mobile
- CSS Transitions (for visual feedback)

### Browser Support

- Chrome (latest 2 versions): ✅ Full support
- Firefox (latest 2 versions): ✅ Full support
- Safari (latest 2 versions): ✅ Full support (may require user interaction for autoplay)
- Edge (latest 2 versions): ✅ Full support

### Graceful Degradation

- If Audio API unavailable: Show error message, disable sound functionality
- If Touch Events unavailable: Fall back to click events only
- If CSS Transitions unavailable: Use JavaScript animations (slower but functional)

