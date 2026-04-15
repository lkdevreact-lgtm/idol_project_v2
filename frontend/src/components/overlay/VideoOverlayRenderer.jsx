import React, { useEffect } from "react";
import { useVideoStore } from "../../hooks/useVideoStore";
import { SOCKET_URL } from "../../utils/constant";

const VideoOverlayRenderer = ({ overlay }) => {
  const clearOverlay = useVideoStore((s) => s.clearOverlay);
  const config = overlay.video_config || {};

  const position = config.position || "center";
  const scale = config.scale || 100;
  const loop = config.loop ?? false;

  // Convert "top-left" to css values
  const getPositionClasses = () => {
    switch (position) {
      case "top-left": return "top-0 left-0";
      case "top-center": return "top-0 left-1/2 -translate-x-1/2";
      case "top-right": return "top-0 right-0";
      case "center-left": return "top-1/2 -translate-y-1/2 left-0";
      case "center": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "center-right": return "top-1/2 -translate-y-1/2 right-0";
      case "bottom-left": return "bottom-0 left-0";
      case "bottom-center": return "bottom-0 left-1/2 -translate-x-1/2";
      case "bottom-right": return "bottom-0 right-0";
      default: return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  const handleEnded = () => {
    if (!loop) {
      clearOverlay();
    }
  };

  useEffect(() => {
    if (!loop && overlay.duration) {
      // In case video doesn't end properly or fails to load, set safety timeout
      const timer = setTimeout(() => {
        clearOverlay();
      }, overlay.duration * 1000 + 2000); // add 2s buffer
      return () => clearTimeout(timer);
    }
  }, [loop, overlay.duration, clearOverlay]);

  if (!overlay.media_url) return null;

  return (
    <div className={`absolute z-[90] pointer-events-none ${getPositionClasses()}`}
         style={{ transform: `scale(${scale / 100}) ${position.includes('center') && !position.includes('top-center') && !position.includes('bottom-center') ? 'translate(-50%, -50%)' : position.includes('center') ? 'translateX(-50%)' : ''}`, transformOrigin: 'center' }}>
      <video
        src={`${SOCKET_URL}${overlay.media_url}`}
        autoPlay
        muted
        playsInline
        loop={loop}
        onEnded={handleEnded}
        className="max-w-[100vw] max-h-[100vh] object-contain drop-shadow-2xl mix-blend-screen"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default VideoOverlayRenderer;
