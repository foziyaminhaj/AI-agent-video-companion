import React, { useEffect, forwardRef } from 'react';

const VideoPlayer = forwardRef(({ stream, isMuted = false, className = '' }, ref) => {
  useEffect(() => {
    if (ref && ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream, ref]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={isMuted}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px',
      }}
    />
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

