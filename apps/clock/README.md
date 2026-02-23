# Netronome - Beat Beacon Metronome

A fully converted TypeScript/JavaScript version of the Haxe/Flash metronome application. An interactive, visual metronome with a circular beat node interface.

## Features

- **Interactive Beat Nodes**: Click on the circle to add beats, drag to reposition
- **Visual Progress**: Rotating arm shows current progress through the bar
- **Quantization**: Hold Ctrl/Shift while dragging for rhythm-based snapping
- **Synchronization**: Global epoch ensures consistent timing across instances
- **BPM Control**: Adjust tempo from 40 to 240 BPM
- **Beat Pattern Persistence**: Save and load beat patterns via URL queries

## Original Technology

The original project was built in:
- **Language**: Haxe
- **Framework**: Flash/Adobe AIR
- **Event System**: Flash EventDispatcher
- **Graphics**: Flash Display API

## New Technology Stack

- **Language**: TypeScript
- **Runtime**: Modern browsers (ES2020+)
- **Rendering**: HTML5 Canvas & SVG
- **Event System**: Custom EventEmitter (similar to Flash's EventDispatcher)
- **Timing**: `performance.now()` and `requestAnimationFrame`
- **Build**: TypeScript compiler (tsc)

## Project Structure

```
src/
├── core/
│   ├── EventEmitter.ts       # Base event dispatcher
│   └── MetronomeEvent.ts     # Custom event type
├── models/
│   └── MetronomeModel.ts     # Core timing engine
├── views/
│   ├── BeaconView.ts         # Main circular visualization
│   ├── NodeView.ts           # Individual beat node
│   ├── ArmView.ts            # Rotating progress indicator
│   └── PieChart.ts           # Canvas drawing utilities
├── controllers/
│   └── (future audio/MIDI)
├── utils/
│   ├── Config.ts             # Configuration & constants
│   └── PieChart.ts           # Utility functions
└── App.ts                    # Main application controller
```

## Installation

### Quick Start (with Vite)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

This starts Vite dev server at http://localhost:5173 with hot module replacement (HMR).

### Production Build

1. Build for production:
   ```bash
   npm run build
   ```

2. Preview production build:
   ```bash
   npm run preview
   ```

3. Deploy the `dist/` folder to your server

For detailed Vite configuration, see [VITE_SETUP.md](./VITE_SETUP.md)

## Usage

### Basic Example

```typescript
import { App } from './src/App';

const app = new App('my-container-id');
app.start();
app.setBPM(120);
```

### Adding Beats Programmatically

```typescript
const metronome = app.getMetronome();
metronome.addBeat(0);    // Beat at 0%
metronome.addBeat(0.25); // Beat at 25%
metronome.addBeat(0.5);  // Beat at 50%
metronome.addBeat(0.75); // Beat at 75%
```

### Loading Patterns

```typescript
// Load from URL query string
app.loadSettings('?p=6000&b=0,0.25,0.5,0.75');

// Export current pattern
const pattern = app.getSettings(); // Returns "?p=6000&b=0,0.25,0.5,0.75"
```

### Listening to Events

```typescript
import { MetronomeEvent } from './src/core/MetronomeEvent';

const metronome = app.getMetronome();

metronome.addEventListener(MetronomeEvent.EVERY_BEAT, (event) => {
  console.log('Beat at', event.progress * 100 + '%');
});

metronome.addEventListener(MetronomeEvent.EVERY_BAR, (event) => {
  console.log('Bar completed');
});
```

## Key Conversions from Haxe

### Flash → TypeScript/JavaScript

| Haxe/Flash | TypeScript/JavaScript |
|------------|----------------------|
| `class extends EventDispatcher` | `class extends EventEmitter` |
| `addEventListener()` | `addEventListener()` |
| `dispatchEvent()` | `dispatchEvent()` |
| Flash Timer | `requestAnimationFrame` |
| `Lib.getTimer()` | `performance.now()` |
| `Sprite` | `HTMLElement` / Canvas |
| `Graphics` | `CanvasRenderingContext2D` |
| `flash.display.Sprite.graphics.drawCircle()` | Canvas `arc()` and `fill()` |
| `Date.now().getTime()` | `Date.now()` |
| Dynamic properties | Generic types or `any` |

### Event System

The Flash EventDispatcher has been replaced with a custom TypeScript implementation:

```typescript
// Haxe/Flash
var timer = new Timer(22, 0);
timer.addEventListener(TimerEvent.TIMER, onTimer);

// TypeScript/JavaScript (using requestAnimationFrame)
let animationFrameId: number | null = null;

const loop = () => {
  onTimer();
  animationFrameId = requestAnimationFrame(loop);
};
animationFrameId = requestAnimationFrame(loop);
```

### Timing & Synchronization

Both versions use a global EPOCH for clock synchronization:

```typescript
// Both versions
static readonly EPOCH = new Date(2012, 11, 21, 0, 0, 0).getTime();

// But calculation differs:
// Haxe: Lib.getTimer() + timeAppStarted
// TypeScript: performance.now() + timeAppStarted
```

## Audio Integration (Future)

The original included `AudioController` for sound playback. This can be added with:

- **Web Audio API** for audio synthesis
- **Tone.js** library for musical timing
- **HTMLAudioElement** for samples

## Browser Compatibility

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Requires ES2020 support

## Performance Notes

- Uses `requestAnimationFrame` for smooth 60fps updates
- Canvas rendering is efficient for the circular visualization
- Event system is optimized for rapid event dispatch
- No external dependencies required

## Contributing

Areas for enhancement:
- Audio playback and synthesis
- MIDI support
- Touch/mobile support improvements
- Undo/redo system
- Visual themes and customization
- Preset patterns library

## License

MIT

## Migration Notes

This conversion maintained the original logic and architecture while adapting to web technologies:

1. **Event System**: Custom EventEmitter replaces Flash's EventDispatcher
2. **Rendering**: Canvas 2D API replaces Flash Display API
3. **Timing**: performance.now() and requestAnimationFrame replace Flash Timer
4. **DOM**: Interactive elements use DOM manipulation instead of Flash Sprites
5. **Type Safety**: Full TypeScript typing for better developer experience

The core algorithms for beat synchronization and timing remain identical to ensure the same behavior and reliability across all instances.
