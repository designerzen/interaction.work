# interaction.works

Welcome to the **interaction.works** monorepo! This workspace encompasses a suite of interconnected applications and packages designed to create instant musical superpowers through accessible, body-controllable interfaces using advanced machine learning, web audio, and immersive 3D rendering.

---

## 🏗️ Architecture Overview

The repository is structured as a `pnpm` workspace containing multiple **Apps** and shared **Packages**.

### 📱 Applications (`/apps`)

1. **PhotoSYNTH** (Main App)
   - **Description**: The flagship accessible musical instrument. It translates face, hand, and body movements into musical expression and dynamic visual feedback.
   - **Tech Stack**: Electron, Vite, TypeScript, Babylon.js, Three.js, MediaPipe, LiteRT, WebMIDI, WebAudio, Faust (WASM).
   - **Key Feature**: Allows users of all physical abilities to play music using a webcam.

2. **interFACE**
   - **Description**: A dedicated application for face landmark tracking, ML model calibration, and advanced display rendering.
   - **Tech Stack**: TypeScript, Vite, WebGPU, LiteRT.
   - **Key Feature**: Provides a testing ground for comparing ML prediction adapters (e.g., MediaPipe vs. LiteRT) and rendering across advanced holographic and GPU backends.

3. **clock** (Netronome App)
   - **Description**: An interactive beat beacon and visual metronome used to synchronize musical flow.

### 📦 Packages (`/packages`)

1. **netronome**
   - **Description**: A musical rhythm and synchronization engine that manages timing and beats across the applications.
   
2. **openGM24**
   - **Description**: An open-source General MIDI soundfont package for high-quality audio playback.

---

## 🌊 Data Flow & System Architecture

The core data flow, specifically within **PhotoSYNTH** and **interFACE**, follows a structured pipeline from physical input to audiovisual output:

```mermaid
graph TD
    %% Input Layer
    subgraph Input Layer
        Webcam[Webcam / Video Stream]
        XR[XR / VR Sensors]
        Hardware[MIDI / Gamepad / Keyboard]
    end

    %% Thinking Layer
    subgraph Thinking Layer (ML Processing)
        TM[ThinkingManager]
        MP[MediaPipe Adapter]
        LRT[LiteRT Adapter]
        TM --> MP
        TM --> LRT
    end

    %% Logic & Control
    subgraph Logic & Control
        AppConfig[Application Core & Automator]
        Rhythm[Netronome Sync Engine]
    end

    %% Output Layer
    subgraph Output Layer (Audio & Visuals)
        Audio[Audio Engine: Web Audio / Faust / MIDI]
        DM[DisplayManager]
        Canvas2D[Canvas 2D Display]
        WebGPU[WebGPU / WebGL 3D Models]
        XRDisplay[Looking Glass Holographic]
    end

    %% Data Flow
    Webcam -->|Video Frames| TM
    Hardware -->|Control Events| AppConfig
    
    TM -->|Landmarks & Blendshapes| AppConfig
    AppConfig <-->|Timing & Beats| Rhythm
    
    AppConfig -->|Musical Notes & Params| Audio
    AppConfig -->|Prediction Data & UI State| DM
    
    DM --> Canvas2D
    DM --> WebGPU
    DM --> XRDisplay
```

### 1. Input Layer
The system primarily ingests video frames from a user's webcam or sensors using the `getUserMedia` API. It also accepts input from traditional hardware (MIDI keyboards, gamepads, computer keyboards).

### 2. Thinking Layer (ML Processing)
The `ThinkingManager` receives video frames and passes them to interchangeable ML Adapters (such as **MediaPipe** or **LiteRT**). These models analyze the frames to extract:
- **Facial Landmarks & Blendshapes** (e.g., mouth opening, eye blinking)
- **Pose & Hand Tracking** (skeletal tracking)

### 3. Logic & Control (The App Core)
The core application receives the prediction data (scores, 3D coordinates, blendshape weights) and maps these values to application logic. It uses the `netronome` package to ensure everything runs on a synchronized beat. For example, opening the mouth might map to an audio filter sweep or trigger a synthesizer note.

### 4. Output Layer
The final state is broadcasted to two main subsystems:
- **Audio Engine**: Synthesizes sound using WebAudio nodes, WASM-compiled Faust instruments, or external WebMIDI connections. Uses `openGM24` for soundfonts.
- **Display System (`DisplayManager`)**: A highly robust, TypeScript-driven rendering pipeline that utilizes a unified `IDisplay` interface. It routes the visual representation to the appropriate backend based on system capabilities:
  - **2D Canvas** (UI, debug overlays, simple filters)
  - **WebGL / WebGPU 3D** (Babylon.js/Three.js avatars, particle systems)
  - **Holographic** (Looking Glass WebXR)

---

## 🛠️ Development Setup

The workspace is managed by `pnpm` and `turbo`.

### Prerequisites
- Node.js (>=22)
- pnpm (>=10.28)

### Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start the Development Server**
   ```bash
   pnpm start
   ```
   *This starts the core Vite development server via TurboRepo.*

3. **Build the Project**
   ```bash
   pnpm build
   ```

4. **Electron Development** (For PhotoSYNTH)
   ```bash
   pnpm electron:dev
   ```

### Code Formatting and Linting
The project uses `oxlint` for rapid linting and standard TypeScript checking.
```bash
pnpm lint
pnpm check-types
```
