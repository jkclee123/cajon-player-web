# Research: Browser Cajon Player

**Date**: 2024-12-19  
**Feature**: Browser Cajon Player  
**Phase**: 0 - Outline & Research

## Research Questions & Findings

### 1. Sound File Format Compatibility

**Question**: What audio format should be used for browser playback? Current `sound/` directory contains `.mov` files (QuickTime video), but `backup/` contains `.mp3` files.

**Decision**: Use `.mp3` files from `backup/` directory (or copy them to `src/assets/sounds/`).

**Rationale**: 
- HTML5 Audio API supports `.mp3`, `.wav`, `.ogg`, `.m4a` formats natively
- `.mov` files are QuickTime video containers, not optimal for audio-only playback
- `.mp3` has excellent browser support (Chrome, Firefox, Safari, Edge all support MP3)
- `.mp3` files are compressed, reducing load times and bandwidth
- Files already exist in `backup/` directory, no conversion needed

**Alternatives Considered**:
- **Convert .mov to .mp3**: Would require additional tooling and processing time
- **Use .wav**: Better quality but much larger file sizes, slower loading
- **Use .ogg**: Good compression but Safari support is limited
- **Use Web Audio API with .mov**: Overly complex for this use case, still requires format conversion

**Implementation Note**: Copy `.mp3` files from `backup/` to `src/assets/sounds/` during setup, or reference them directly if structure allows.

---

### 2. Low-Latency Audio Playback Strategy

**Question**: How to achieve ≤100ms latency from user interaction to sound playback?

**Decision**: Use HTML5 Audio API with pre-loaded Audio objects and `play()` method. Create multiple Audio instances per sound for overlapping playback.

**Rationale**:
- HTML5 Audio API `play()` method has low latency when audio is pre-loaded
- Pre-loading audio files eliminates network delay
- Creating multiple Audio instances allows overlapping sounds (required by FR-007)
- Simpler than Web Audio API for this use case (no audio processing needed)

**Best Practices**:
- Pre-load all audio files on application initialization
- Create a pool of Audio objects per sound (e.g., 3-5 instances) for rapid triggering
- Use `new Audio(src)` constructor for each instance
- Set `preload="auto"` attribute or call `load()` method
- Monitor `canplaythrough` event to ensure files are ready before allowing interaction

**Alternatives Considered**:
- **Web Audio API**: More powerful but adds complexity, not needed for simple playback
- **Single Audio instance per sound**: Would require stopping/restarting, causing latency
- **Lazy loading**: Would introduce network delay, violates performance requirements

**Implementation Pattern**:
```javascript
// Create audio pool for each sound
const audioPool = [];
for (let i = 0; i < 3; i++) {
  const audio = new Audio('path/to/sound.mp3');
  audio.preload = 'auto';
  audioPool.push(audio);
}

// Play from pool (find available instance)
function playSound() {
  const audio = audioPool.find(a => a.paused || a.ended) || audioPool[0];
  audio.currentTime = 0; // Reset to start
  audio.play();
}
```

---

### 3. Touch Event Handling for Mobile

**Question**: How to handle touch events on mobile devices while maintaining compatibility with mouse clicks?

**Decision**: Use both `click` and `touchstart` events, with `preventDefault()` on touch to avoid double-firing.

**Rationale**:
- Modern browsers fire `click` events after touch events, which can cause double-triggering
- `touchstart` provides immediate feedback (better UX than waiting for click)
- Need to prevent default touch behavior to avoid browser zoom/scroll
- Must handle both for cross-device compatibility

**Best Practices**:
- Listen for `touchstart` events on mobile, `click` events on desktop
- Use feature detection: `'ontouchstart' in window` to detect touch support
- Call `event.preventDefault()` on touch events to prevent default browser behavior
- Use `pointer-events: none` CSS for non-interactive elements to improve performance
- Consider `touch-action: manipulation` CSS to disable double-tap zoom

**Alternatives Considered**:
- **Pointer Events API**: More modern but requires polyfill for Safari
- **Click events only**: Works but has delay on mobile (waits for click, not touchstart)
- **Mouse events only**: Doesn't work on touch-only devices

**Implementation Pattern**:
```javascript
const isTouchDevice = 'ontouchstart' in window;
const eventType = isTouchDevice ? 'touchstart' : 'click';

element.addEventListener(eventType, (e) => {
  if (isTouchDevice) {
    e.preventDefault(); // Prevent double-firing and browser defaults
  }
  playSound();
});
```

---

### 4. Visual Feedback Implementation

**Question**: How to provide immediate visual feedback when trigger zones are activated (FR-009)?

**Decision**: Use CSS transitions/transforms for visual feedback (opacity change, scale, or color change) triggered by JavaScript class toggling.

**Rationale**:
- CSS transitions are hardware-accelerated and performant
- Immediate visual response (no JavaScript animation delays)
- Simple to implement and maintain
- Works well with the ≤100ms latency requirement

**Best Practices**:
- Use CSS `:active` pseudo-class for immediate feedback
- Add JavaScript class for programmatic feedback (keyboard triggers)
- Keep transition duration short (50-100ms) to feel responsive
- Use `transform` and `opacity` for best performance (GPU-accelerated)
- Consider subtle effects: slight scale (1.05x), opacity change (0.8), or color shift

**Alternatives Considered**:
- **JavaScript animations**: More flexible but adds latency and complexity
- **Canvas-based animations**: Overkill for simple feedback
- **SVG animations**: More complex, not needed for simple state changes

**Implementation Pattern**:
```css
.trigger-zone {
  transition: transform 0.05s, opacity 0.05s;
}

.trigger-zone:active,
.trigger-zone.active {
  transform: scale(1.05);
  opacity: 0.8;
}
```

```javascript
function activateZone(element) {
  element.classList.add('active');
  setTimeout(() => element.classList.remove('active'), 50);
}
```

---

### 5. Audio Preloading Strategy

**Question**: How to preload all audio files efficiently to meet ≤3 second load time requirement?

**Decision**: Load all audio files in parallel during application initialization, show loading indicator, disable interaction until `canplaythrough` events fire for all sounds.

**Rationale**:
- Parallel loading maximizes network utilization
- Prevents user interaction before sounds are ready (avoids silent failures)
- Provides clear feedback about loading state
- Meets performance requirement (SC-002: ≤3 seconds to interactive)

**Best Practices**:
- Load all audio files simultaneously (browser handles parallel requests)
- Track loading progress with `canplaythrough` events
- Show loading indicator/progress to user
- Disable trigger zones until all sounds are loaded
- Handle loading errors gracefully (show message, allow partial functionality)

**Alternatives Considered**:
- **Lazy loading**: Violates performance requirements, introduces latency
- **Sequential loading**: Slower than parallel, unnecessary
- **On-demand loading**: Would cause delays on first trigger, violates ≤100ms requirement

**Implementation Pattern**:
```javascript
const sounds = ['sound1.mp3', 'sound2.mp3', ...];
const loadedSounds = new Set();

function preloadSounds() {
  const promises = sounds.map(src => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.addEventListener('canplaythrough', () => {
        loadedSounds.add(src);
        resolve();
      });
      audio.addEventListener('error', reject);
      audio.preload = 'auto';
    });
  });
  
  return Promise.all(promises);
}

// On app init
preloadSounds().then(() => {
  enableInteraction();
  hideLoadingIndicator();
});
```

---

### 6. Keyboard Input Handling

**Question**: How to handle keyboard input with focus detection (FR-008: only respond when app has focus)?

**Decision**: Use `keydown` event listener on `window` or `document`, check `document.hasFocus()` or track focus/blur events.

**Rationale**:
- `keydown` events fire immediately (better than `keypress` for responsiveness)
- `document.hasFocus()` provides reliable focus detection
- Tracking `focus`/`blur` events on window provides state management
- Simple and well-supported across browsers

**Best Practices**:
- Listen for `keydown` on `document` or `window`
- Check focus state before processing key events
- Map keys to sounds using a configuration object
- Ignore modifier keys (Ctrl, Alt, Shift) unless needed
- Consider preventing default behavior for assigned keys to avoid browser shortcuts

**Alternatives Considered**:
- **keypress events**: Deprecated, less reliable
- **keyup events**: Too late, adds perceived latency
- **Input element focus**: Overly complex, not needed

**Implementation Pattern**:
```javascript
let appHasFocus = true;

window.addEventListener('focus', () => { appHasFocus = true; });
window.addEventListener('blur', () => { appHasFocus = false; });

document.addEventListener('keydown', (e) => {
  if (!appHasFocus) return;
  
  const sound = keyMap[e.key];
  if (sound) {
    e.preventDefault(); // Prevent browser shortcuts
    playSound(sound);
  }
});
```

---

### 7. Error Handling for Audio Playback

**Question**: How to handle audio playback failures gracefully (FR-010, FR-011)?

**Decision**: Wrap `play()` calls in try-catch, handle promise rejections, provide user feedback for errors, allow application to continue functioning.

**Rationale**:
- `audio.play()` returns a Promise that can reject (browser autoplay policies)
- User interaction typically resolves autoplay restrictions
- Need graceful degradation to maintain usability
- Should log errors for debugging but not break the UI

**Best Practices**:
- Wrap `play()` in try-catch or handle Promise rejection
- Check for `audio.error` property after loading
- Provide visual/console feedback for errors
- Allow retry on user interaction
- Consider showing error message if audio completely fails to load

**Implementation Pattern**:
```javascript
async function playSound(audio) {
  try {
    await audio.play();
  } catch (error) {
    console.warn('Audio playback failed:', error);
    // Audio might be blocked by browser policy
    // User interaction should resolve this
  }
}

// Check for loading errors
audio.addEventListener('error', (e) => {
  console.error('Audio loading failed:', audio.error);
  // Show user-friendly message or disable that sound
});
```

---

## Summary of Technical Decisions

1. **Audio Format**: Use `.mp3` files (copy from `backup/` directory)
2. **Audio API**: HTML5 Audio API with pre-loaded Audio object pools
3. **Touch Handling**: `touchstart` events with `preventDefault()` for mobile
4. **Visual Feedback**: CSS transitions with JavaScript class toggling
5. **Preloading**: Parallel loading with `canplaythrough` event tracking
6. **Keyboard Input**: `keydown` events with focus detection
7. **Error Handling**: Try-catch around `play()`, error event listeners, graceful degradation

All decisions align with constitution principles:
- ✅ User Experience First (low latency, immediate feedback)
- ✅ Cross-Browser Compatibility (standard APIs, graceful degradation)
- ✅ Performance Standards (preloading, efficient event handling)
- ✅ Progressive Enhancement (works with basic HTML5 Audio)
- ✅ Simplicity (vanilla JavaScript, no frameworks)

