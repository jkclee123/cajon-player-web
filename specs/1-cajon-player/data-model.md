# Data Model: Browser Cajon Player

**Date**: 2024-12-19  
**Feature**: Browser Cajon Player  
**Phase**: 1 - Design & Contracts

## Overview

This is a frontend-only application with no persistent data storage. The data model represents the in-memory state and configuration of the application.

## Entities

### SoundZone

Represents a clickable/tappable area on the cajon interface that triggers a specific sound.

**Properties**:
- `id` (string, required): Unique identifier for the zone (e.g., "kick-center", "snare-left")
- `name` (string, required): Human-readable name (e.g., "Kick Center", "Snare Left")
- `soundFile` (string, required): Path to the audio file (e.g., "sounds/cajon-off-kick-4.mp3")
- `keyboardKey` (string, optional): Keyboard key that triggers this zone (e.g., "q", "w", "e")
- `coordinates` (object, required): Visual position and size of the zone
  - `x` (number): X coordinate (percentage or pixels)
  - `y` (number): Y coordinate (percentage or pixels)
  - `width` (number): Width (percentage or pixels)
  - `height` (number): Height (percentage or pixels)
- `element` (HTMLElement, optional): DOM element reference (set at runtime)

**Relationships**:
- One SoundZone → One SoundFile (many-to-one)
- One SoundZone → Zero or One KeyboardKey (one-to-zero-or-one)

**State Transitions**:
- `idle` → `active` (on click/tap/keyboard press)
- `active` → `idle` (after visual feedback completes, ~50ms)

**Validation Rules**:
- `id` must be unique across all zones
- `soundFile` must reference a valid audio file path
- `keyboardKey` must be unique if provided (no two zones can share the same key)
- `coordinates` must define a valid rectangular area
- `coordinates` values must be positive numbers

**Example**:
```javascript
{
  id: "kick-center",
  name: "Kick Center",
  soundFile: "sounds/cajon-off-kick-4.mp3",
  keyboardKey: "q",
  coordinates: {
    x: 40,  // percentage
    y: 60,  // percentage
    width: 20,
    height: 30
  }
}
```

---

### SoundFile

Represents an audio file that can be played.

**Properties**:
- `path` (string, required): File path relative to application root (e.g., "sounds/cajon-off-kick-4.mp3")
- `name` (string, required): Human-readable name (e.g., "Cajon Off Kick 4")
- `type` (string, optional): Sound type category (e.g., "kick", "snare", "roll")
- `audioPool` (Array<Audio>, optional): Pool of Audio objects for overlapping playback (created at runtime)
- `isLoaded` (boolean, optional): Whether the audio file has finished loading (runtime state)
- `loadError` (Error, optional): Error object if loading failed (runtime state)

**Relationships**:
- Many SoundZones → One SoundFile (many-to-one)

**State Transitions**:
- `unloaded` → `loading` (when preload starts)
- `loading` → `loaded` (on `canplaythrough` event)
- `loading` → `error` (on `error` event)

**Validation Rules**:
- `path` must be a valid file path
- `path` must reference an existing file (at build/runtime)
- File format must be supported by HTML5 Audio API (.mp3, .wav, .ogg, .m4a)

**Example**:
```javascript
{
  path: "sounds/cajon-off-kick-4.mp3",
  name: "Cajon Off Kick 4",
  type: "kick",
  audioPool: [Audio, Audio, Audio], // Created at runtime
  isLoaded: true,
  loadError: null
}
```

---

### ApplicationState

Represents the overall state of the application.

**Properties**:
- `isLoading` (boolean, required): Whether audio files are still loading
- `isReady` (boolean, required): Whether application is ready for interaction
- `hasFocus` (boolean, required): Whether the application window has focus
- `loadedSounds` (Set<string>, required): Set of sound file paths that have loaded
- `totalSounds` (number, required): Total number of sound files to load
- `errors` (Array<Error>, optional): Array of loading/playback errors

**State Transitions**:
- `initializing` → `loading` (on app start)
- `loading` → `ready` (when all sounds loaded)
- `loading` → `error` (if critical sounds fail to load)
- `ready` → `ready` (focus changes don't affect ready state)

**Validation Rules**:
- `isReady` can only be `true` if `isLoading` is `false`
- `loadedSounds.size` cannot exceed `totalSounds`
- `hasFocus` reflects actual browser focus state

**Example**:
```javascript
{
  isLoading: false,
  isReady: true,
  hasFocus: true,
  loadedSounds: new Set([
    "sounds/cajon-off-kick-4.mp3",
    "sounds/cajon-off-snare-1.mp3",
    // ... all sounds
  ]),
  totalSounds: 14,
  errors: []
}
```

---

## Data Flow

### Initialization Flow

1. Application starts → `ApplicationState.isLoading = true`
2. Load sound file configurations → Create `SoundFile` objects
3. Create `SoundZone` objects with references to `SoundFile` objects
4. Preload audio files → Create `Audio` pools for each `SoundFile`
5. Track loading progress → Update `ApplicationState.loadedSounds`
6. All sounds loaded → `ApplicationState.isReady = true`, `isLoading = false`

### Interaction Flow

1. User interaction (click/tap/keyboard) → Identify `SoundZone`
2. Check `ApplicationState.isReady` → If false, ignore interaction
3. Get `SoundFile` from `SoundZone`
4. Get available `Audio` instance from `SoundFile.audioPool`
5. Play audio → Update `SoundZone` state to `active`
6. Visual feedback → Reset `SoundZone` state to `idle` after 50ms

### Error Flow

1. Audio loading fails → Set `SoundFile.loadError`, add to `ApplicationState.errors`
2. Audio playback fails → Log error, allow retry on next interaction
3. Critical sounds fail → Show error message, disable affected zones

## Constraints

- No persistent storage: All data exists only in memory during application runtime
- No user data: No user accounts, preferences, or history stored
- No external APIs: All functionality is self-contained in the browser
- Stateless design: Application resets to initial state on page reload

## Notes

- Sound zones are defined statically in configuration (not dynamically created)
- Audio pools are created at initialization time (not on-demand)
- Focus state is tracked via browser events (not stored)
- Error state is logged but doesn't prevent application from functioning (graceful degradation)

