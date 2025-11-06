# Video Segmentation App

Real-time video matting and background replacement directly in the browser using TensorFlow.js and Robust Video Matting (RVM).

Built with React, TypeScript, and Feature-Sliced Design (FSD) architecture.

## 🚀 Features

- Online background removal and replacement for video and streams (camera or files)
- Runs entirely on the client (no server), automatic WebGPU/WebGL/WASM/CPU backend selection via TensorFlow.js
- RVM — robust neural network with temporal state support for smooth segmentation
- Works with photos, video files, and webcam
- Flexible FSD structure
- Background options: solid color, image, or original background blur
- Speed and memory optimizations: asynchronous rendering, automatic backend, safe memory management

## 🗂 Project Structure (FSD)

```
src/
  features/             # Features, business logic
  entities/             # Entities (if needed)
  shared/
    lib/
      ml/               # Model algorithms, processors
        video-segmenter/
          video-segmenter.ts
          types.ts
        rvm/
          infer-rvm.ts
          compose.ts
          load-rvm.ts
    ui/                 # Pure UI components
  widgets/              # Large UI assemblies (right panel, etc.)
  pages/                # Route pages
  app/                  # Entry point, routing
  process/              # Initialization, config, runtime
```

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Download RVM Model

- Get the TFJS export of the RVM model (e.g., `rvm_mobilenetv3_tfjs_int8.zip`)
- Extract to `public/models/rvm_mobilenetv3_tfjs_int8/` so you have:
  - `public/models/rvm_mobilenetv3_tfjs_int8/model.json`
  - `public/models/rvm_mobilenetv3_tfjs_int8/group1-shard*.bin`

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

## 🤖 ML Pipeline

- Each video frame is normalized and fed to the RVM TFJS model with temporal state
- Outputs are combined as RGBA and composited with the selected background
- Result is rendered to canvas or as ImageBitmap for further processing
- All tensors and resources are explicitly freed to avoid memory leaks

## ⚡ Tech Stack

- **Frontend**: React + TypeScript
- **ML**: TensorFlow.js (WebGPU/WebGL/WASM/CPU)
- **Model**: Robust Video Matting (RVM)
- **Architecture**: Feature-Sliced Design (FSD)
- **State Management**: Zustand
- **Build Tools**: Vite, ESLint, Prettier

## 📦 Key Files

- `src/shared/lib/ml/video-segmenter/video-segmenter.ts`: Main segmentation pipeline
- `src/shared/lib/ml/rvm/`: Model loading, inference, and composition utilities
- `src/features/rvm-infer/rvm-infer.tsx`: Main inference loop and React integration
- `src/widgets/video-output/video-output.tsx`: Right panel, UI composition

## 🧹 Memory and Performance

- **Memory leak prevention**: All objects, tensors, and bitmaps are cleaned up as early as possible (see code comments)
- **OffscreenCanvas**: Used when available for better performance
- **Automatic backend selection**: Chooses the fastest available backend (WebGPU > WebGL > WASM > CPU)
- **Optimized rendering**: Up to 30 FPS, asynchronous to avoid browser and GPU overload

## 🚀 Deployment

The app can be deployed to any static hosting service since it runs entirely in the browser:

```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting platform.

## 🔧 Configuration

The app automatically detects the best TensorFlow.js backend, but you can configure:

- Model path in the configuration files
- Performance settings (FPS, resolution)
- Background options

## 📝 License

MIT

## 🙏 Acknowledgments

- [Robust Video Matting (RVM)](https://github.com/PeterL1n/RobustVideoMatting)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Feature-Sliced Design Community](https://feature-sliced.design/)