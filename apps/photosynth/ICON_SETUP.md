# Electron Icon Setup

## Overview
Icons have been generated for the PhotoSYNTH Electron app using `electron-icon-maker`.

## Generated Icon Files

### PNG Icons (Linux and other uses)
Located in: `build/icons/icons/png/`
- 16x16.png
- 24x24.png
- 32x32.png
- 48x48.png
- 64x64.png
- 128x128.png
- 256x256.png
- 512x512.png
- 1024x1024.png

### Windows Icon
Located in: `build/icons/icons/win/`
- icon.ico (multi-resolution Windows icon)

### macOS Icon
Located in: `build/icons/icons/mac/`
- icon.icns (macOS icon bundle)

## Configuration

### Package.json
Added script: `pnpm icons`
```json
"icons": "electron-icon-maker --input=./source/assets/icons/icon.png --output=./build/icons"
```

To regenerate icons if needed:
```bash
pnpm icons
```

### electron-builder.yml
Updated with icon references for each platform:
- **Windows**: Uses `build/icons/icons/win/icon.ico`
- **macOS**: Uses `build/icons/icons/mac/icon.icns`
- **Linux**: Uses `build/icons/icons/png/512x512.png`

## Building with Icons

Run the distribution builds:
```bash
# All platforms
pnpm dist

# Windows only
pnpm dist:win

# macOS only
pnpm dist:mac

# Linux only
pnpm dist:linux
```

## Notes
- Source icon: `source/assets/icons/icon.png`
- The icons are automatically bundled into the app installers/packages
- Git should ignore the `build/` directory (add to `.gitignore` if not present)
