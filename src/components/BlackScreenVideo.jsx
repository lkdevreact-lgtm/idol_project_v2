import { useEffect, useRef } from "react";

export const BlackScreenVideo = ({ videoSrc }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const video = videoRef.current;
    video.src = videoSrc;
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.preload = "auto";

    const handleLoaded = () => {
      video.play().catch((err) => {
        console.error("Autoplay failed:", err);
      });
    };

    video.addEventListener("loadeddata", handleLoaded);

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("loadeddata", handleLoaded);
    };
  }, [videoSrc]);

  return (
    <>
      {/* Layer đen để tránh blend dính background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "black",
          zIndex: 0,
        }}
      />

      <video
        ref={videoRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center bottom",
          zIndex: 1,

          // 🔥 QUAN TRỌNG: tắt blend
          mixBlendMode: "normal",

          pointerEvents: "none",
        }}
      />
    </>
  );
};