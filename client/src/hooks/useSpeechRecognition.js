import { useEffect, useState, useRef } from 'react';

const useSpeechRecognition = (isEnabled = true, language = 'en-US') => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition if no speech detected
        if (isEnabled && isListening) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.error('Error restarting recognition:', e);
            }
          }, 1000);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled
      if (isEnabled) {
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }, 100);
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language]);

  // Start/stop recognition based on isEnabled
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) {
      return;
    }

    const recognition = recognitionRef.current;

    if (isEnabled && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        // Already started or other error
        console.log('Recognition start:', error.message);
      }
    } else if (!isEnabled && isListening) {
      recognition.stop();
      setIsListening(false);
      setTranscript('');
    }
  }, [isEnabled, isSupported, isListening]);

  return {
    transcript,
    isListening,
    isSupported,
  };
};

export default useSpeechRecognition;

