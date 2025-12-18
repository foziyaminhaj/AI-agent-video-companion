# 🚀 Quick Start Guide - AI Features

## Step 1: Download Models (Required for Emotion Detection)

Run the helper script:
```bash
node download-models.js
```

Or manually download from:
- https://github.com/justadudewhohacks/face-api.js/tree/master/weights
- Save to `client/public/models/`

## Step 2: Start the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```

## Step 3: Test the Features

1. Open `http://localhost:3000` in your browser
2. Join a room
3. Start a video call
4. **Emotion Detection:** Make facial expressions - you'll see emotion indicators
5. **Live Captions:** Speak - captions will appear at the bottom of your video
6. **Real-time Sync:** Both users see each other's emotions and captions

## ✅ Features Working?

- ✅ **Emotion Detection:** See emoji and emotion label above your video
- ✅ **Live Captions:** See your speech as text below your video
- ✅ **Color Borders:** Video border changes color based on emotion
- ✅ **Remote Sync:** See remote user's emotion and captions

## 🐛 Troubleshooting

**Models not loading?**
- Check `client/public/models/` contains 4 files
- Clear browser cache
- Check browser console for errors

**Speech recognition not working?**
- Use Chrome or Edge browser
- Grant microphone permissions
- Ensure HTTPS or localhost

**Emotions not detected?**
- Ensure face is visible
- Check lighting
- Verify models are loaded (check console)

---

For detailed setup instructions, see `AI_FEATURES_SETUP.md`

