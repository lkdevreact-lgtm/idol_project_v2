import React, { useRef, useEffect } from "react";

/**
 * Standard Video Player component that supports transparency (if the source has it, e.g. .webm with alpha)
 * and avoids expensive canvas processing that could cause noise/artifacts.
 */
export const BlackScreenVideo = ({ videoSrc, onVideoEnded }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = async () => {
      try {
        await video.play();
      } catch (err) {
        console.warn("Autoplay was prevented. Retrying in muted mode...", err);
        video.muted = true;
        await video.play().catch(e => console.error("Playback failed:", e));
      }
    };

    handlePlay();
  }, [videoSrc]);

  return (
    <div className="absolute inset-0 z-[10] flex items-center justify-center bg-transparent pointer-events-none">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        onEnded={onVideoEnded}
        onError={(e) => {
          console.error("Video error:", e);
          onVideoEnded(); // Skip to next if error
        }}
        // Standard video does NOT have the blocky noise of Canvas pixel-looping.
        style={{
          display: "block",
          filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))"
        }}
      />
    </div>
  );
};
