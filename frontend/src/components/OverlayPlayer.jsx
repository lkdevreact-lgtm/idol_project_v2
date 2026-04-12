import React, { useEffect, useRef } from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import { useGiftStore } from "../hooks/useGiftStore";
import { SOCKET_URL } from "../utils/constant";

/**
 * OverlayPlayer
 * Hiển thị file overlay (.webm trong suốt hoặc .gif) đè lên màn hình video
 * khi hệ thống nhận được quà tặng TikTok.
 *
 * - WEBM: dùng <video> với onEnded → tự clearOverlay()
 * - GIF : dùng <img> + setTimeout(overlayDuration) → tự clearOverlay()
 */
const OverlayPlayer = () => {
  const activeOverlayUrl  = useVideoStore((s) => s.activeOverlayUrl);
  const clearOverlay      = useVideoStore((s) => s.clearOverlay);
  const gifts             = useGiftStore((s)  => s.gifts);
  const timerRef          = useRef(null);

  // Lấy overlayDuration từ gift tương ứng với URL đang active
  const getOverlayDuration = () => {
    if (!activeOverlayUrl) return 3;
    const gift = gifts.find(
      (g) => g.overlayMedia === activeOverlayUrl
    );
    return Number(gift?.overlayDuration) > 0
      ? Number(gift.overlayDuration)
      : 3;
  };

  // Detect loại file
  const url  = activeOverlayUrl;
  const ext  = url ? url.split(".").pop().toLowerCase() : "";
  const isGif = ext === "gif";
  const isVideo = ["webm", "mp4", "mov", "ogg"].includes(ext);

  // Resolve URL tuyệt đối (handle path bắt đầu bằng "/")
  const resolvedUrl = url
    ? url.startsWith("http")
      ? url
      : `${SOCKET_URL}${url}`
    : null;

  // Auto-clear cho GIF qua setTimeout
  useEffect(() => {
    if (!url || !isGif) return;
    const duration = getOverlayDuration();
    timerRef.current = setTimeout(() => {
      clearOverlay();
    }, duration * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!url) return null;

  return (
    <div
      className="absolute inset-0 z-[50] flex items-center justify-center pointer-events-none"
      style={{ animation: "overlayFadeIn 0.15s ease-out" }}
    >
      {isGif ? (
        <img
          src={resolvedUrl}
          alt="transition overlay"
          className="w-full h-full object-contain"
          style={{ imageRendering: "auto" }}
        />
      ) : isVideo ? (
        <video
          key={url}
          autoPlay
          muted
          playsInline
          onEnded={clearOverlay}
          className="w-full h-full object-contain"
          style={{ background: "transparent" }}
        >
          <source src={resolvedUrl} />
        </video>
      ) : (
        // Fallback: thử dùng <video> cho loại file không xác định
        <video
          key={url}
          autoPlay
          muted
          playsInline
          onEnded={clearOverlay}
          className="w-full h-full object-contain"
        >
          <source src={resolvedUrl} />
        </video>
      )}
    </div>
  );
};

export default OverlayPlayer;
