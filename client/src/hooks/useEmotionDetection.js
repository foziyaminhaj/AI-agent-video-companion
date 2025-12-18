import { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';

const useEmotionDetection = (videoRef, isEnabled = true) => {
  const [emotion, setEmotion] = useState(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const detectionIntervalRef = useRef(null);

  // Emotion emoji mapping
  const emotionEmoji = {
    happy: '😄',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    surprised: '😲',
    disgusted: '🤢',
    neutral: '😐',
    funny: '😂', // Special case: very high happy confidence
  };

  // Load face-api.js models with CDN fallback
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Try local models first
        const LOCAL_MODEL_URL = '/models';
        const CDN_MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
        
        let modelUrl = LOCAL_MODEL_URL;
        let modelsLoaded = false;

        // Try loading from local first
        try {
          console.log('Attempting to load models from:', LOCAL_MODEL_URL);
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_MODEL_URL),
          ]);
          modelsLoaded = true;
          console.log('✅ Models loaded successfully from local directory');
        } catch (localError) {
          console.warn('Local models not found, trying CDN...', localError.message);
          
          // Fallback to CDN
          try {
            console.log('Attempting to load models from CDN:', CDN_MODEL_URL);
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODEL_URL),
              faceapi.nets.faceExpressionNet.loadFromUri(CDN_MODEL_URL),
            ]);
            modelsLoaded = true;
            console.log('✅ Models loaded successfully from CDN');
          } catch (cdnError) {
            console.error('Failed to load models from CDN:', cdnError);
            throw cdnError;
          }
        }
        
        if (modelsLoaded) {
          setIsModelLoaded(true);
          setLoadingError(null);
        }
      } catch (error) {
        console.error('❌ Error loading face-api.js models:', error);
        setLoadingError(error.message);
        setIsModelLoaded(false);
        console.log('💡 To fix: Download models to /public/models/ or ensure CDN access');
      }
    };

    loadModels();
  }, []);

  // Start emotion detection
  useEffect(() => {
    if (!isEnabled || !isModelLoaded) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    if (!videoRef?.current) {
      console.log('⏳ Waiting for video element...');
      return;
    }

    const video = videoRef.current;
    
    // Wait for video to be ready
    const checkVideoReady = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        startDetection();
      } else {
        video.addEventListener('loadedmetadata', checkVideoReady, { once: true });
        video.addEventListener('canplay', checkVideoReady, { once: true });
      }
    };

    const detectEmotion = async () => {
      try {
        if (!video || video.readyState < 2 || video.videoWidth === 0) {
          return;
        }

        // Debug: Log video dimensions occasionally (every 10th call)
        if (Math.random() < 0.1) {
          console.log('📹 Video ready:', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
        }

        // Use more accurate detection options
        const detection = await faceapi
          .detectSingleFace(
            video, 
            new faceapi.TinyFaceDetectorOptions({ 
              inputSize: 416, // Increased for better accuracy
              scoreThreshold: 0.4 // Lower threshold to detect more faces
            })
          )
          .withFaceExpressions();

        if (detection && detection.expressions) {
          const expressions = detection.expressions;
          
          // Filter out very low confidence emotions
          const filteredExpressions = Object.entries(expressions)
            .filter(([_, confidence]) => confidence > 0.1);
          
          if (filteredExpressions.length > 0) {
            const sortedEmotions = filteredExpressions.sort(
              (a, b) => b[1] - a[1]
            );
            
            const [dominantEmotion, confidence] = sortedEmotions[0];

            // Special handling: Very high happy confidence = "funny"
            let finalEmotion = dominantEmotion;
            if (dominantEmotion === 'happy' && confidence > 0.85) {
              finalEmotion = 'funny';
            }

            // Only update if confidence is above threshold
            if (confidence > 0.3) {
              setEmotion(finalEmotion);
              setEmotionConfidence(confidence);
            } else {
              // Low confidence - set to neutral
              setEmotion('neutral');
              setEmotionConfidence(confidence);
            }
          } else {
            setEmotion(null);
            setEmotionConfidence(0);
          }
        } else {
          // No face detected
          setEmotion(null);
          setEmotionConfidence(0);
        }
      } catch (error) {
        console.error('Error detecting emotion:', error);
        // Don't spam console on every failed detection
      }
    };

    const startDetection = () => {
      // Clear any existing interval
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      // Run detection every 300ms for better responsiveness
      detectionIntervalRef.current = setInterval(detectEmotion, 300);
      
      // Run initial detection immediately
      detectEmotion();
    };

    checkVideoReady();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      if (video) {
        video.removeEventListener('loadedmetadata', checkVideoReady);
        video.removeEventListener('canplay', checkVideoReady);
      }
    };
  }, [isEnabled, isModelLoaded, videoRef]);

  return {
    emotion,
    emotionConfidence,
    emotionEmoji: emotion ? emotionEmoji[emotion] : null,
    isModelLoaded,
    loadingError,
  };
};

export default useEmotionDetection;



