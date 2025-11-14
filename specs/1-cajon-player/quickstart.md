# Quickstart Guide: Browser Cajon Player

**Date**: 2024-12-19  
**Feature**: Browser Cajon Player

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Local web server (for development) or static hosting (for production)
- Sound files in `.mp3` format (available in `backup/` directory)

## Setup

### 1. Prepare Sound Files

Copy `.mp3` files from `backup/` directory to `src/assets/sounds/`:

```bash
mkdir -p src/assets/sounds
cp backup/*.mp3 src/assets/sounds/
```

### 2. Project Structure

Ensure the following structure exists:

```
cajon-online/
├── index.html
├── src/
│   ├── js/
│   │   ├── audio-manager.js
│   │   ├── trigger-zones.js
│   │   ├── input-handler.js
│   │   └── app.js
│   ├── css/
│   │   └── styles.css
│   └── assets/
│       ├── images/
│       │   └── cajon.png
│       └── sounds/
│           └── *.mp3
```

### 3. Create HTML Entry Point

Create `index.html` with basic structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cajon Player</title>
    <link rel="stylesheet" href="src/css/styles.css">
</head>
<body>
    <div id="app">
        <div id="loading-indicator">Loading sounds...</div>
        <div id="cajon-container">
            <!-- Trigger zones will be added here -->
        </div>
        <div id="keyboard-hint">Press keys to play sounds</div>
    </div>
    <script src="src/js/audio-manager.js"></script>
    <script src="src/js/trigger-zones.js"></script>
    <script src="src/js/input-handler.js"></script>
    <script src="src/js/app.js"></script>
</body>
</html>
```

### 4. Configure Sound Zones

Define trigger zones in `src/js/trigger-zones.js`:

```javascript
const ZONE_CONFIG = [
  {
    id: "kick-center",
    name: "Kick Center",
    soundFile: "src/assets/sounds/cajon-off-kick-4.mp3",
    keyboardKey: "q",
    coordinates: { x: 40, y: 60, width: 20, height: 30 }
  },
  // ... more zones
];
```

### 5. Run Local Server

Start a local web server (required for audio loading):

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

### 6. Open in Browser

Navigate to `http://localhost:8000` in your browser.

## Usage

### Playing Sounds

**Visual Interface**:
1. Wait for loading indicator to disappear
2. Click or tap on grey trigger zones on the cajon image
3. Sound plays immediately with visual feedback

**Keyboard**:
1. Ensure the browser tab/window has focus
2. Press assigned keyboard keys (displayed on screen or in documentation)
3. Sound plays immediately

### Keyboard Key Assignments

(To be defined based on sound zones - example:)
- `q` - Kick Center
- `w` - Snare Left
- `e` - Snare Right
- `r` - Kick Damp
- etc.

## Development Workflow

### 1. Modify Sound Zones

Edit `src/js/trigger-zones.js` to add/remove/modify zones.

### 2. Update Styling

Edit `src/css/styles.css` to change visual appearance.

### 3. Adjust Audio Behavior

Edit `src/js/audio-manager.js` to modify preloading, pooling, or playback logic.

### 4. Test

- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices (touch events)
- Test keyboard input
- Test rapid clicking/tapping
- Test overlapping sounds
- Test error scenarios (disable audio, block autoplay, etc.)

## Troubleshooting

### Sounds Don't Play

- Check browser console for errors
- Verify sound files are in correct location
- Ensure local server is running (required for audio loading)
- Check browser autoplay policies (user interaction may be required)
- Verify audio files are valid `.mp3` format

### High Latency

- Check network tab for slow loading
- Verify audio files are pre-loaded (check loading indicator)
- Ensure audio pool is created (check console logs)
- Test in different browsers (some have better audio performance)

### Touch Events Not Working

- Verify `touchstart` event listeners are attached
- Check for JavaScript errors in console
- Test on actual mobile device (browser dev tools may not fully simulate)
- Ensure `preventDefault()` is called on touch events

### Keyboard Not Working

- Verify browser tab/window has focus
- Check `keydown` event listeners are attached
- Verify keyboard key mappings are correct
- Check for conflicts with browser shortcuts

## Performance Checklist

- [ ] All sounds load within 3 seconds
- [ ] Sound triggers respond within 100ms
- [ ] Can play 5+ sounds per second without lag
- [ ] Overlapping sounds work correctly
- [ ] Visual feedback is immediate
- [ ] Works on mobile devices
- [ ] Works in all target browsers

## Next Steps

After setup:
1. Create cajon image with trigger zones marked
2. Define all sound zone coordinates
3. Assign keyboard keys to zones
4. Implement visual feedback
5. Add loading indicator
6. Test across browsers and devices
7. Optimize for performance

