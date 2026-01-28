# PhotoSYNTH Electron Version

This directory contains both the web and Electron versions of PhotoSYNTH.

## Directory Structure

```
source/
├── electron/
│   ├── main.ts       # Main Electron process
│   └── preload.ts    # Preload script for IPC communication
├── pages/            # Web app pages
├── components/       # Web app components
└── assets/           # Web app assets

public/              # Static assets
dist/                # Built web app (for Electron renderer)
dist-electron/       # Built Electron main & preload processes
```

## Development

### Web Version (Vite)
```bash
pnpm run dev
# Opens at http://localhost:909
```

### Electron Version (Development)
```bash
pnpm run dev:electron
# Runs both Vite dev server and Electron app
```

Or separately:
```bash
pnpm run electron:dev
# Runs Electron with hot reload
```

## Building

### Web Build
```bash
pnpm run build
```

### Electron Build
```bash
pnpm run electron:build
```

### Distribution (Packaged Apps)
```bash
# All platforms
pnpm run dist

# Windows only
pnpm run dist:win

# macOS only
pnpm run dist:mac

# Linux only
pnpm run dist:linux

# Directory build (for testing)
pnpm run dist:dir
```

## Configuration Files

- `electron.vite.config.ts` - Electron-specific Vite configuration
- `electron-builder.yml` - Electron Builder distribution configuration
- `source/electron/main.ts` - Main process entry point
- `source/electron/preload.ts` - Preload script with IPC bridge

## IPC Communication

The preload script exposes the following methods to the renderer process:

```typescript
window.electron.getAppVersion() // Get app version
window.electron.openFile() // Open file dialog
```

## Features

- Hot reload during development
- Auto-updates (using electron-updater)
- File dialogs and native menus
- Automatic code signing for macOS and Windows
- Multiple distribution formats (NSIS, DMG, AppImage, etc.)

## Notes

- The renderer process uses the same `source/` files as the web version
- The Electron app loads from `dist-electron/main` in production
- During development, it connects to the Vite dev server at `http://localhost:909`
