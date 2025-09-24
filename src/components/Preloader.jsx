import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import preloader from "@/assets/videos/intro_viddd.mp4";

export default function Preloader({ onVideoEnd, hintText = "Click To Start", poster }) {
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCoarse, setIsCoarse] = useState(false);

  // Detect coarse pointer once (hide mouse hint on touch)
  useEffect(() => {
    try {
      const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
      const update = () => setIsCoarse(!!mq.matches);
      update();
      mq.addEventListener?.("change", update);
      return () => mq.removeEventListener?.("change", update);
    } catch {
      /* no-op */
    }
  }, []);

  // Try autoplay immediately (muted + playsInline allows it on most browsers)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryAutoplay = async () => {
      try {
        await v.play();
        setHasStarted(true);
      } catch {
        // Autoplay blocked — user will tap/click to start
      }
    };
    tryAutoplay();

    // Hard stop safety (don’t trap users if video never ends)
    const MAX_MS = 15000; // 15s cap; adjust if your intro is shorter/longer
    const t = setTimeout(() => onVideoEnd?.(), MAX_MS);
    return () => clearTimeout(t);
  }, [onVideoEnd]);

  const handleScreenClick = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!hasStarted) {
      v.play().then(() => setHasStarted(true)).catch(() => {/* ignore */});
    }
  };

  const handleMouseMove = (e) => {
    if (!isCoarse) setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSkip = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (v) v.pause();
    onVideoEnd && onVideoEnd();
  };

  const handleVideoError = () => {
    // Fail open: if video cannot play, don’t block the site
    onVideoEnd && onVideoEnd();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-pointer bg-black"
      onClick={handleScreenClick}
      onMouseMove={handleMouseMove}
      onTouchStart={handleScreenClick}
      aria-label="Intro video preloader"
      role="dialog"
    >
      <video
        ref={videoRef}
        src={preloader}
        preload="metadata"        // fast first paint; avoids large prefetch
        playsInline
        muted
        autoPlay                 // attempt silent autoplay; falls back to tap
        controls={false}
        onEnded={onVideoEnd}
        onError={handleVideoError}
        poster={poster}          // optional fast poster
        className="h-full w-full object-cover block"
      />

      {/* Cursor-following hint (desktop only, until started) */}
      {!hasStarted && !isCoarse && (
        <div
          className="fixed z-[10000] pointer-events-none select-none text-white font-semibold rounded-full border border-white/90 px-2.5 py-1.5 whitespace-nowrap bg-black/20 backdrop-blur-sm"
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

      {/* Transparent Skip button (shows once video has started) */}
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
