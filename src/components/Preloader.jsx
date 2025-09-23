// src/components/Preloader.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import preloader from "@/assets/videos/intro_viddd.mp4";

/**
 * Preloader (with cursor-following hint bubble)
 * - Works on iOS Safari (inline, trusted gesture via overlay onPointerDown).
 * - Keeps your original cursor-following "Click/Tap to Start" hint.
 * - Keyboard accessible (Enter/Space).
 * - Skip button while playing (unchanged).
 */
export default function Preloader({
  onVideoEnd,
  hintText = "Click To Start",
  poster,             // optional poster image
  allowSkip = true,
  autoHideOnEnd = true,
}) {
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false); // touch devices
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Detect coarse pointer (touch devices => hide the cursor-following hint)
  useEffect(() => {
    try {
      const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
      const update = () => setIsCoarse(!!mq.matches);
      update();
      mq.addEventListener?.("change", update);
      return () => mq.removeEventListener?.("change", update);
    } catch {}
  }, []);

  // Lock page scroll while preloader is visible
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Ensure inline playback + muted set before any load (iOS quirk)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.setAttribute("playsinline", "true");
      v.setAttribute("webkit-playsinline", "true");
      v.setAttribute("x5-playsinline", "true");
      v.disablePictureInPicture = true;
      v.preload = "auto";
      v.load?.(); // nudge Safari to fetch metadata/poster early
    } catch {}
  }, []);

  const startPlayback = async () => {
    const v = videoRef.current;
    if (!v || hasStarted) return;
    try {
      v.muted = true; // reassert just in case
      v.setAttribute("playsinline", "true");
      await v.play();
      setHasStarted(true);
    } catch (err) {
      console.error("Preloader play error:", err);
    }
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startPlayback();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startPlayback();
    }
  };

  const handlePointerMove = (e) => {
    if (isCoarse) return;
    // Use clientX/Y so the hint follows the visible pointer
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSkip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { videoRef.current?.pause(); } catch {}
    onVideoEnd?.();
  };

  const handleEnded = () => {
    if (autoHideOnEnd) onVideoEnd?.();
  };

  const handleLoadedMetadata = () => setReady(true);
  const handleVideoError = (err) => {
    console.error("Video playback failed:", err);
    // If video can’t load, don’t block the user
    onVideoEnd?.();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      role="dialog"
      aria-label="Intro video preloader"
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* The video itself never intercepts pointer events (Safari quirk) */}
      <video
        ref={videoRef}
        src={preloader}
        poster={poster}
        className="h-full w-full object-cover pointer-events-none"
        muted
        playsInline
        controls={false}
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noplaybackrate"
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
      />

      {/* Fullscreen overlay to capture the FIRST user gesture reliably */}
      {!hasStarted && (
        <div
          className="absolute inset-0"
          role="button"
          tabIndex={0}
          aria-label={hintText}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          onPointerMove={handlePointerMove}
        >
          {/* Cursor-following hint bubble (like before) */}
          {!isCoarse && (
            <div
              className="fixed z-[10000] pointer-events-none select-none text-white font-semibold rounded-full border border-white/90 px-2.5 py-1.5 whitespace-nowrap bg-white/10 backdrop-blur"
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
          {/* On touch devices, no bubble (tap anywhere to start) */}
        </div>
      )}

      {/* Skip button while playing (unchanged) */}
      {allowSkip && hasStarted && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          className="absolute bottom-5 right-5 z-[10001] rounded-full bg-transparent text-white border border-white/70 px-3 py-2 h-auto hover:bg-white/10 hover:border-white/90 active:scale-[0.98] transition"
        >
          Skip
        </Button>
      )}

      {/* Minimal “loading…” hint (optional) */}
      {!ready && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-xs">
          Loading…
        </div>
      )}
    </div>
  );
}
