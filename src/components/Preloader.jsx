// src/components/Preloader.jsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import preloader from "@/assets/videos/intro_viddd.mp4";

/**
 * Preloader
 * - Fast render (poster/solid bg), blocks app behind it.
 * - Reliable "Tap/Click to Start" overlay (works on iOS Safari).
 * - Pointer + keyboard accessible (Space/Enter).
 * - Video stays inline (no forced fullscreen on iOS).
 * - Skip button while playing.
 */
export default function Preloader({
  onVideoEnd,
  hintText = "Tap to start",
  poster,             // optional poster image URL for instant paint
  allowSkip = true,   // show/enable "Skip" button
  autoHideOnEnd = true
}) {
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false); // touch devices
  const [ready, setReady] = useState(false);       // video metadata loaded

  // Detect coarse pointer (mobile/touch)
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
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, []);

  // Ensure iOS inline playback + muted set before any load
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.muted = true;
      v.setAttribute("playsinline", "true");
      v.setAttribute("webkit-playsinline", "true");
      v.setAttribute("x5-playsinline", "true"); // some Android browsers
      v.disablePictureInPicture = true;
      v.preload = "auto";
      // Force a load so poster/first frame is known quickly
      // (especially helpful on Safari with poster)
      v.load?.();
    } catch {}
  }, []);

  // Start playback from a trusted user gesture (pointerdown covers mouse & touch)
  const startPlayback = async () => {
    const v = videoRef.current;
    if (!v || hasStarted) return;
    try {
      // re-assert muted & playsinline just in case
      v.muted = true;
      v.setAttribute("playsinline", "true");
      await v.play();
      setHasStarted(true);
    } catch (err) {
      // Some Safari cases might still refuse; show a minimal fallback message in console.
      console.error("Preloader play error:", err);
    }
  };

  const handlePointerDown = (e) => {
    // Ensure the overlay/button captures the gesture
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

  const handleSkip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      videoRef.current?.pause();
    } catch {}
    onVideoEnd?.();
  };

  const handleEnded = () => {
    if (autoHideOnEnd) onVideoEnd?.();
  };

  const handleLoadedMetadata = () => setReady(true);
  const handleVideoError = (err) => {
    console.error("Video playback failed:", err);
    // Fallback: if video can't load, immediately end preloader
    onVideoEnd?.();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      role="dialog"
      aria-label="Intro video preloader"
      // Disable long-press callout and selection on iOS Safari
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* Video (pointer-events: none so overlay receives the gestures reliably on Safari) */}
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

      {/* Center start overlay (only before playback starts) */}
      {!hasStarted && (
        <div
          className="absolute inset-0 grid place-items-center"
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={hintText}
        >
          <div className="flex flex-col items-center gap-4 text-white">
            {/* Subtle pulse ring for attention */}
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
              <button
                type="button"
                className="relative z-10 rounded-full bg-white/15 backdrop-blur px-6 py-3 text-base md:text-lg font-semibold border border-white/40 hover:bg-white/25 active:scale-[0.98] transition"
              >
                {hintText}
              </button>
            </div>
            {/* Tiny helper text; hide on coarse to reduce clutter */}
            {!isCoarse && (
              <p className="text-xs md:text-sm text-white/80">
                Press <kbd className="rounded bg-white/20 px-1">Enter</kbd> to start
              </p>
            )}
          </div>
        </div>
      )}

      {/* Skip button while playing */}
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

      {/* Optional lightweight ready indicator (kept minimal) */}
      {!ready && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-xs">
          Loading…
        </div>
      )}
    </div>
  );
}
