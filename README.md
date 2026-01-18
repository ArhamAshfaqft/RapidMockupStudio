# Bulk Mockup Master

Professional offline mockup generator with realistic fabric warping and lighting effects.

## Features

- **4-Layer Composition Engine**: Background → Displacement → Design → Texture Overlay
- **WebGL Rendering**: Pixi.js powered for high-performance graphics
- **Realistic Warping**: Displacement filter creates fabric-like distortion
- **Batch Processing**: Process hundreds of designs with memory-efficient queue system
- **Full Resolution Export**: Maintains original mockup resolution
- **100% Offline**: No internet or API required

## Installation

```bash
npm install
npm start
```

## Building Executables

```bash
# Windows
npm run build:win

# macOS
npm run build:mac
```

## Usage

1. **Load Base Mockup**: Click "Upload Base Image" to select your blank mockup (t-shirt, mug, etc.)
2. **Select Design Folder**: Choose a folder containing your PNG/JPG designs
3. **Select Output Folder**: Choose where to save the generated mockups
4. **Position Sample Design**: Drag a design onto the canvas to set placement
5. **Adjust Settings**:
   - **Warp Strength**: 0 (flat) → 30 (t-shirt) → 100 (silk)
   - **Texture Overlay**: Adds fabric grain realism
   - **Blend Mode**: Multiply works best for most mockups
6. **Generate**: Click "Generate All Files" to batch process

## Controls

- **Drag**: Move design position
- **Scroll**: Resize design
- **Shift+Drag**: Rotate design
- **Sliders**: Fine-tune all parameters

## Technical Stack

- Electron (Desktop framework)
- Pixi.js (WebGL rendering)
- Node.js (File system operations)
- Vanilla JavaScript (No framework bloat)

## The Rendering Pipeline

```
Layer 1: Base Mockup (Background)
Layer 2: Displacement Map (Uses mockup contrast for warping)
Layer 3: Design (With displacement filter applied)
Layer 4: Texture Overlay (Multiply blend for realism)
```

## Requirements

- Windows 10+ or macOS 10.14+
- 4GB RAM minimum
- GPU with WebGL support
