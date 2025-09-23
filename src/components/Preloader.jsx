import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import preloader from "@/assets/videos/intro_viddd.mp4";

export default function Preloader({ onVideoEnd, hintText = "Click To Start" }) {
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCoarse, setIsCoarse] = useState(false); // Hide hint on touch devices

  // Preloading video to prioritize it
  useEffect(() => {
    try {
      const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
      const update = () => setIsCoarse(!!mq.matches);
      update();
      mq.addEventListener?.("change", update);
      return () => mq.removeEventListener?.("change", update);
    } catch {
      // If matchMedia not available, do nothing
    }
  }, []);

  // Auto-start the video on click or touch
  const handleScreenClick = (e) => {
    if (videoRef.current && !hasStarted) {
      videoRef.current
        .play()
        .then(() => setHasStarted(true))
        .catch((err) => console.error("Preloader play error:", err));
    }
  };

  // Track mouse movement for hint positioning
  const handleMouseMove = (e) => {
    if (!isCoarse) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle skipping the video
  const handleSkip = (e) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.pause();
    onVideoEnd && onVideoEnd();
  };

  // Handling video playback errors
  const handleVideoError = (err) => {
    console.error("Video playback failed:", err);
    // Fallback logic if video fails to load
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={handleScreenClick}
      onMouseMove={handleMouseMove}
      onTouchStart={handleScreenClick} // Fallback for touch devices
      aria-label="Intro video preloader"
      role="dialog"
    >
      <video
        ref={videoRef}
        src={preloader}
        preload="auto" // Preload the video for faster loading
        playsInline
        muted={true} // Ensure muted for autoplay to work on mobile
        controls={false}
        onEnded={onVideoEnd}
        onError={handleVideoError}
        className="h-full w-full object-cover block"
      />

      {/* Cursor-following hint (hidden after start or on touch devices) */}
      {!hasStarted && !isCoarse && (
        <div
          className="fixed z-[10000] pointer-events-none select-none text-white font-semibold rounded-full border border-white/90 px-2.5 py-1.5 whitespace-nowrap"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(14px, 14px)",
            fontFamily:
              "var(--font-primary, system-ui, -apple-system, Segoe UI, Roboto)",
            fontSize: "0.95rem",
          }}
        >
          {hintText}
        </div>
      )}

      {/* Transparent Skip button */}
      {hasStarted && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          className="absolute bottom-5 right-5 z-[10001] rounded-full bg-transparent text-white border border-white/70 px-3 py-2 h-auto hover:bg-white/10 hover:border-white/90 active:scale-[0.98] transition"
        >
          Skip
        </Button>
      )}
    </div>
  );
}
