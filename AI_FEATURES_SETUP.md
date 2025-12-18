# AI Features Setup Guide

This guide will help you set up the AI-based emotion detection and live captions features for the WebRTC video calling app.

## 🎯 Features Implemented

✅ **Emotion Detection** - Real-time facial expression analysis using face-api.js
✅ **Live Captions** - Speech-to-text using Web Speech API
✅ **Real-time Sync** - AI data synchronized between users via Socket.IO
✅ **Visual Indicators** - Emotion-based borders, emojis, and caption overlays

---

## 📦 Prerequisites

1. **Node.js** installed (v14 or higher)
2. **npm** or **yarn** package manager
3. **Modern browser** (Chrome, Edge, Firefox) with WebRTC support

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

The `face-api.js` package has already been installed. If you need to reinstall:

```bash
cd client
npm install face-api.js
```

### Step 2: Download face-api.js Models

The emotion detection feature requires pre-trained models. You need to download them:

#### Option A: Manual Download (Recommended)

1. Create the models directory (if it doesn't exist):
   ```bash
   mkdir client/public/models
   ```

2. Download the required model files from the face-api.js repository:
   - Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
   - Download these files to `client/public/models/`:
     - `tiny_face_detector_model-weights_manifest.json`
     - `tiny_face_detector_model-shard1`
     - `face_expression_model-weights_manifest.json`
     - `face_expression_model-shard1`

#### Option B: Using Git (Alternative)

```bash
cd client/public
git clone https://github.com/justadudewhohacks/face-api.js.git temp-face-api
cp -r temp-face-api/weights/* models/
rm -rf temp-face-api
```

#### Option C: Direct Download Links

You can download the models directly:

1. **Tiny Face Detector Model:**
   - Manifest: https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
   - Shard: https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

2. **Face Expression Model:**
   - Manifest: https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
   - Shard: https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1

Save these files to `client/public/models/` directory.

### Step 3: Verify Models Directory Structure

Your `client/public/models/` directory should contain:
```
models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_expression_model-weights_manifest.json
└── face_expression_model-shard1
```

### Step 4: Start the Application

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```
   Server will run on `http://localhost:8000`

2. **Start the client:**
   ```bash
   cd client
   npm start
   ```
   Client will run on `http://localhost:3000`

---

## 🎨 Features Overview

### Emotion Detection

- **Detects 7 emotions:** Happy, Sad, Angry, Neutral, Surprised, Fearful, Disgusted
- **Real-time analysis:** Updates every 500ms
- **Visual feedback:** 
  - Color-coded borders (Green=Happy, Red=Angry, etc.)
  - Emotion emoji indicators
  - Confidence percentage

### Live Captions

- **Speech-to-text:** Converts audio to text in real-time
- **Browser-based:** Uses Web Speech API (no server processing)
- **Auto-restart:** Automatically restarts if speech stops
- **Visual overlay:** Captions displayed at bottom of video

### Real-time Sync

- **Socket.IO integration:** AI data synced between users
- **Low latency:** Updates sent immediately when detected
- **Bidirectional:** Both users see each other's emotions and captions

---

## 🔧 Technical Details

### Architecture

```
Frontend (React)
├── useEmotionDetection.js - Emotion detection hook
├── useSpeechRecognition.js - Speech recognition hook
├── VideoPlayer.jsx - Video component with ref support
└── Room.jsx - Main room component with AI integration

Backend (Node.js)
└── index.js - Socket.IO server with AI data handler
```

### Key Technologies

- **face-api.js** - Facial expression recognition
- **Web Speech API** - Browser-based speech recognition
- **Socket.IO** - Real-time bidirectional communication
- **React Hooks** - Custom hooks for AI features
- **WebRTC** - Peer-to-peer video streaming

---

## 🐛 Troubleshooting

### Models Not Loading

**Problem:** Console shows "Error loading face-api.js models"

**Solution:**
1. Verify models are in `client/public/models/` directory
2. Check file names match exactly (case-sensitive)
3. Ensure models are accessible via HTTP (check browser Network tab)
4. Clear browser cache and reload

### Speech Recognition Not Working

**Problem:** Captions not appearing

**Solution:**
1. Check browser compatibility (Chrome/Edge recommended)
2. Ensure microphone permissions are granted
3. Check browser console for errors
4. Verify HTTPS or localhost (required for Web Speech API)

### Emotion Detection Not Working

**Problem:** No emotions detected

**Solution:**
1. Ensure face is clearly visible in video
2. Check lighting conditions
3. Verify models are loaded (check console)
4. Ensure video stream is active

### Socket.IO Connection Issues

**Problem:** AI data not syncing between users

**Solution:**
1. Verify server is running on port 8000
2. Check Socket.IO connection in browser console
3. Ensure both users are in the same room
4. Check network/firewall settings

---

## 📝 Browser Compatibility

### Emotion Detection
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ⚠️ Safari (Limited support)

### Speech Recognition
- ✅ Chrome/Edge (Best support)
- ✅ Firefox (Limited)
- ❌ Safari (Not supported)

---

## 🎯 Usage Tips

1. **Best Results:**
   - Use Chrome or Edge browser
   - Ensure good lighting for emotion detection
   - Speak clearly for accurate captions
   - Grant microphone and camera permissions

2. **Performance:**
   - Emotion detection runs every 500ms
   - Models load once on component mount
   - Speech recognition auto-restarts on silence

3. **Privacy:**
   - All AI processing happens client-side
   - No audio/video sent to external servers
   - Only emotion labels and transcripts synced via Socket.IO

---

## 📚 Additional Resources

- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

## ✨ Future Enhancements

Potential improvements:
- [ ] Emotion history/graph
- [ ] Multi-language speech recognition
- [ ] Emotion-based filters/effects
- [ ] Sentiment analysis from captions
- [ ] Recording and playback with AI data

---

## 📄 License

This implementation follows the same license as the original project.

