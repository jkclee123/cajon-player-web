# Cajon Player Web

A web-based interactive cajon (percussion instrument) player that allows users to play cajon sounds through their browser. Play sounds by clicking/tapping on visual trigger zones or using keyboard keys.

## Features

- **Visual Interface**: Click or tap on grey trigger zones overlaid on a cajon image to play sounds
- **Keyboard Controls**: Use keyboard keys as an alternative input method for faster playing
- **Multiple Sound Zones**: 14 different trigger zones with various cajon sounds (kicks, snares, rolls)
- **Overlapping Playback**: Play multiple sounds simultaneously without interruption
- **Responsive Design**: Works on both desktop and mobile devices
- **Optimized for Mobile**: Ultra-low latency audio playback with Web Audio API and touch optimizations
- **No Dependencies**: Pure vanilla JavaScript, HTML, and CSS - no build process required

## Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Local web server (for development)

### Setup

1. **Clone or download the repository**

2. **Start a local web server** (required for audio loading):

   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server -p 8000

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**

   Navigate to `http://localhost:8000` in your browser.

4. **Wait for sounds to load**

   The loading indicator will show progress. Once complete, you're ready to play!

## Usage

### Playing Sounds

**Visual Interface:**
- Click or tap on the grey trigger zones displayed on the cajon image
- Each zone plays its unique sound immediately
- Visual feedback is provided when zones are activated

**Keyboard:**
- Ensure the browser tab/window has focus
- Press the assigned keyboard keys (see Keyboard Controls below)
- Sounds play immediately on key press

### Keyboard Controls

The keyboard is mapped across multiple keys for each sound zone, allowing flexible playing:

**Top Row - Snare (Off Wires):**
- `Snare Left`: `` ` ``, `1`, `2`, `3`, `4`, `5`, `6`
- `Snare Right`: `7`, `8`, `9`, `0`, `-`, `+`, `Backspace`, `Delete`

**Second Row - Snare (With Wires On):**
- `Snare On 1`: `Tab`, `Q`, `W`, `E`
- `Snare On 2`: `R`, `T`, `Y`, `U`, `I`
- `Snare On 3`: `O`, `P`, `[`, `]`, `\`

**Third Row - Snare Rolls:**
- `Snare Roll Slow 1`: `A`, `S`, `D`
- `Snare Roll Slow 2`: `F`, `G`, `H`
- `Snare Roll Fast`: `J`, `K`, `L`
- `Snare Roll On`: `;`, `'`, `Enter`

**Bottom Row - Kicks:**
- `Kick Damp 1`: `Left Shift`, `Z`, `X`
- `Kick Damp 2`: `C`, `V`, `B`
- `Kick Center`: `Space`
- `Kick Damp On 1`: `N`, `M`, `,`
- `Kick Damp On 2`: `.`, `/`, `Right Shift`

## Project Structure

```
cajon-online/
├── index.html              # Main HTML entry point
├── src/
│   ├── js/
│   │   ├── app.js          # Main application coordinator
│   │   ├── audio-manager.js    # Audio loading and playback management
│   │   ├── input-handler.js    # Mouse, touch, and keyboard input handling
│   │   ├── trigger-zones.js    # Trigger zone DOM management
│   │   └── zone-config.js      # Zone configuration and keyboard mappings
│   ├── css/
│   │   └── styles.css      # Application styles
│   └── assets/
│       ├── images/
│       │   └── cajon.svg   # Cajon image
│       └── sounds/         # MP3 sound files
│           └── *.mp3
├── sounds/                 # Original sound files (.mov format)
└── specs/                  # Project specifications and documentation
```

## Technologies

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling and responsive design with touch optimizations
- **Vanilla JavaScript (ES6+)**: Application logic
- **Web Audio API**: Ultra-low latency audio playback using AudioContext and AudioBufferSourceNode

## Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Performance

- **Ultra-low latency**: Sound triggers respond within <20ms using Web Audio API
- **Mobile optimized**: Eliminated 300ms touch delay with `touch-action: manipulation`
- **Instant visual feedback**: UI updates immediately before audio playback
- **High throughput**: Supports playing 10+ sounds per second without lag
- **Efficient loading**: All sounds pre-loaded using fetch API and decodeAudioData
- **Resource efficient**: AudioBufferSourceNode creates sources on-demand for optimal memory usage

## Development

### Modifying Sound Zones

Edit `src/js/zone-config.js` to add, remove, or modify trigger zones:

```javascript
{
    id: "zone-id",
    name: "Zone Name",
    soundFile: "src/assets/sounds/sound-file.mp3",
    keyboardKey: ["key1", "key2"],
    coordinates: { x: 40, y: 60, width: 20, height: 30 }
}
```

### Updating Styles

Edit `src/css/styles.css` to customize the visual appearance.

### Audio Configuration

Edit `src/js/audio-manager.js` to modify:
- Audio context settings (latency hint, sample rate)
- Preloading behavior
- Playback logic
- Audio context unlock/resume behavior

## Troubleshooting

### Sounds Don't Play

- Ensure you're running a local web server (required for audio loading)
- Check browser console for errors
- Verify sound files exist in `src/assets/sounds/`
- Check browser autoplay policies (user interaction may be required)

### Keyboard Not Working

- Ensure the browser tab/window has focus
- Check for conflicts with browser shortcuts
- Verify keyboard mappings in `zone-config.js`

### Touch Events Not Working

- Test on an actual mobile device (browser dev tools may not fully simulate)
- Check for JavaScript errors in console
- Ensure pointer event listeners are properly attached
- Verify audio context is unlocked (first touch should unlock it automatically)

### Mobile Performance Issues

- Ensure you're using a modern browser with Web Audio API support
- First touch interaction unlocks the audio context (required for mobile browsers)
- Check that CSS `touch-action: manipulation` is applied (eliminates 300ms delay)
- Verify audio files are loading correctly (check network tab)

## License

[Add your license here]

## Contributing

[Add contribution guidelines if applicable]

