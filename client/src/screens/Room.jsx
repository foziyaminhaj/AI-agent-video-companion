import React, { useEffect, useCallback, useState, useRef } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import useEmotionDetection from "../hooks/useEmotionDetection";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import VideoPlayer from "../components/VideoPlayer";
import "./RoomPage.css"; // ✅ Import CSS file

// Emotion emoji mapping (shared constant)
const emotionEmojiMap = {
  happy: '😄',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  surprised: '😲',
  disgusted: '🤢',
  neutral: '😐',
  funny: '😂', // Special case: very high happy confidence
};

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  
  // Refs for video elements (needed for face-api.js)
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // AI Features - Local (My Stream)
  const {
    emotion: myEmotion,
    emotionConfidence: myEmotionConfidence,
    emotionEmoji: myEmotionEmoji,
    isModelLoaded,
    loadingError: modelLoadingError,
  } = useEmotionDetection(myVideoRef, !!myStream);
  
  const {
    transcript: myTranscript,
    isListening: myIsListening,
    isSupported: speechSupported,
  } = useSpeechRecognition(!!myStream);
  
  // AI Features - Remote (Other User)
  const [remoteEmotion, setRemoteEmotion] = useState(null);
  const [remoteEmotionEmoji, setRemoteEmotionEmoji] = useState(null);
  const [remoteTranscript, setRemoteTranscript] = useState('');

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  // Note: VideoPlayer component handles setting srcObject via ref
  // No need to manually set it here - VideoPlayer does it automatically

  // Send AI data to remote user
  useEffect(() => {
    if (remoteSocketId && (myEmotion || myTranscript)) {
      socket.emit("ai:data", {
        to: remoteSocketId,
        emotion: myEmotion,
        emotionConfidence: myEmotionConfidence,
        transcript: myTranscript,
      });
    }
  }, [remoteSocketId, myEmotion, myTranscript, myEmotionConfidence, socket]);

  // Handle incoming AI data from remote user
  const handleAIData = useCallback(({ emotion, transcript }) => {
    setRemoteEmotion(emotion);
    setRemoteEmotionEmoji(emotion ? emotionEmojiMap[emotion] : null);
    setRemoteTranscript(transcript || '');
  }, []); // emotionEmojiMap is stable, no need in deps

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("ai:data", handleAIData);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("ai:data", handleAIData);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleAIData,
  ]);

  return (
    <div className="room-container">
      <div className="room-card">
        <h1>Room Page</h1>
        <h4>{remoteSocketId ? "🟢 Connected" : "🔴 Waiting for user..."}</h4>

        <div>
          {myStream && (
            <button onClick={sendStreams} className="room-btn">
              Send Stream
            </button>
          )}
          {remoteSocketId && (
            <button onClick={handleCallUser} className="room-btn">
              Call
            </button>
          )}
        </div>

        <div className="video-section">
          {myStream && (
            <div className={`video-container video-container-local ${myEmotion ? `emotion-${myEmotion}` : ''}`}>
              <div className="video-header">
                <h2>My Stream</h2>
                {myEmotion && (
                  <div className="emotion-indicator">
                    <span className="emotion-emoji">{myEmotionEmoji}</span>
                    <span className="emotion-label">{myEmotion}</span>
                    <span className="emotion-confidence">
                      {Math.round(myEmotionConfidence * 100)}%
                    </span>
                  </div>
                )}
                {!isModelLoaded && !modelLoadingError && (
                  <div className="model-loading">Loading AI models...</div>
                )}
                {modelLoadingError && (
                  <div className="model-error">
                    ⚠️ Models not loaded. {modelLoadingError.includes('CDN') ? 'Download models manually.' : 'Check console for details.'}
                  </div>
                )}
                {isModelLoaded && !myEmotion && (
                  <div className="emotion-status">👁️ Looking for face...</div>
                )}
              </div>
              <div className="video-wrapper">
                <VideoPlayer stream={myStream} isMuted={true} ref={myVideoRef} />
                {myTranscript && (
                  <div className="caption-overlay caption-local">
                    {myTranscript}
                  </div>
                )}
                {myIsListening && (
                  <div className="speech-indicator">
                    🎤 Listening...
                  </div>
                )}
                {!speechSupported && (
                  <div className="speech-warning">
                    ⚠️ Speech recognition not supported
                  </div>
                )}
              </div>
            </div>
          )}

          {remoteStream && (
            <div className={`video-container video-container-remote ${remoteEmotion ? `emotion-${remoteEmotion}` : ''}`}>
              <div className="video-header">
                <h2>Remote Stream</h2>
                {remoteEmotion && (
                  <div className="emotion-indicator">
                    <span className="emotion-emoji">{remoteEmotionEmoji}</span>
                    <span className="emotion-label">{remoteEmotion}</span>
                  </div>
                )}
              </div>
              <div className="video-wrapper">
                <VideoPlayer stream={remoteStream} isMuted={false} ref={remoteVideoRef} />
                {remoteTranscript && (
                  <div className="caption-overlay caption-remote">
                    {remoteTranscript}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
