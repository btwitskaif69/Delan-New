"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PrBanner from "./PrBanner";

/**
 * Enhanced Flipping Card (shadcn + Tailwind)
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg'            -> height presets (default 'md')
 * - frontLines: [l1, l2, l3]            -> heading lines on the front
 * - backText: string                    -> paragraph on the back
 * - theme: string                       -> hex/rgb/css variable (brand color)
 * - frontBg: string                     -> front background color
 * - backBg: string                      -> back background color
 * - autoFlip: boolean                   -> flip automatically (default false)
 * - autoFlipDelay: number               -> ms delay for auto flip (default 5000)
 * - flipOnHover: boolean                -> desktop hover flips card (default false)
 * - showArrows: boolean                 -> show decorative arrows (default true)
 * - className: string                   -> extra classes on outer wrapper
 * - startFlipped: boolean               -> initial flip state
 * - onFlip?: (isFlipped:boolean) => void
 */
export default function FlippingCard({
  size = "md",
  frontLines = ["DELAN", "REMEMBER", "HER"],
  backText = `Finding clothes that show who you really are, while lasting beyond quick fashion trends feels impossible.
For 25 years, Delan has helped modern women solve this problem with perfectly fitted pieces made from beautiful, long-lasting fabrics that never go out of style.
We don't just make clothes, we create confidence.
When you wear Delan, you're not copying others. You're showing the world who you are. Own it #TrustYourStyle`,
  theme = "#8C4F6B",
  frontBg = "#faefef",
  backBg = "#f9f1f1",
  autoFlip = false,
  autoFlipDelay = 5000,
  flipOnHover = false,
  showArrows = true,
  className = "",
  startFlipped = false,
  onFlip,
}) {
  const [isFlipped, setIsFlipped] = useState(startFlipped);
  const prefersReduced = usePrefersReducedMotion();
  const containerRef = useRef(null);
  const pointerStartX = useRef(null);
  const hoverFlip = flipOnHover && !prefersReduced;

  const heightClass = useMemo(() => {
    switch (size) {
      case "sm":
        return "h-[300px]";
      case "lg":
        return "h-[480px]";
      case "md":
      default:
        return "h-[600px]";
    }
  }, [size]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((f) => {
      const next = !f;
      onFlip?.(next);
      return next;
    });
  }, [onFlip]);

  // Auto flip (pause on hover/focus)
  useEffect(() => {
    if (!autoFlip || prefersReduced) return;
    const el = containerRef.current;
    let timer = setInterval(() => toggleFlip(), autoFlipDelay);

    function pause() {
      clearInterval(timer);
    }
    function resume() {
      clearInterval(timer);
      timer = setInterval(() => toggleFlip(), autoFlipDelay);
    }

    el?.addEventListener("mouseenter", pause);
    el?.addEventListener("mouseleave", resume);
    el?.addEventListener("focusin", pause);
    el?.addEventListener("focusout", resume);

    return () => {
      clearInterval(timer);
      el?.removeEventListener("mouseenter", pause);
      el?.removeEventListener("mouseleave", resume);
      el?.removeEventListener("focusin", pause);
      el?.removeEventListener("focusout", resume);
    };
  }, [autoFlip, autoFlipDelay, toggleFlip, prefersReduced]);

  // Pointer swipe to flip (mobile-friendly)
  const onPointerDown = (e) => {
    pointerStartX.current = getPointX(e);
  };
  const onPointerUp = (e) => {
    const sx = pointerStartX.current;
    const ex = getPointX(e);
    if (sx == null || ex == null) return;
    const dx = ex - sx;
    if (Math.abs(dx) > 40) {
      toggleFlip();
    }
    pointerStartX.current = null;
  };

  // Keyboard controls
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIsFlipped(true);
      onFlip?.(true);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIsFlipped(false);
      onFlip?.(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={[
        "w-full flex items-center justify-center overflow-visible [perspective:1000px] py-10",
        heightClass,
        className,
      ].join(" ")}
      style={
        {
          // expose theme and bg as CSS vars for arbitrary color usage
          ["--card-theme"]: theme,
          ["--card-front"]: frontBg,
          ["--card-back"]: backBg,
        }
      }
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? "Show front" : "Show back"}
        onClick={() => !hoverFlip && toggleFlip()}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        // 3D core
        className={[
          "relative h-full w-[min(880px,92%)] mx-auto group",
          "transition-transform duration-700 motion-reduce:transition-none",
          "[transform-style:preserve-3d] [transform-origin:center]",
          isFlipped ? "[transform:rotateY(180deg)]" : "",
          // optional hover flip for desktop
          hoverFlip ? "hover:[transform:rotateY(180deg)] focus-within:[transform:rotateY(180deg)]" : "",
          // focus ring
          "focus-visible:outline-none",
          "focus-visible:ring-[color:var(--card-theme)]",
        ].join(" ")}
      >
        {/* FRONT */}
        <Card
          className={[
            "absolute inset-0 rounded-2xl shadow-sm",
            "bg-[color:var(--card-front)] [backface-visibility:hidden]",
          ].join(" ")}
          style={{ WebkitBackfaceVisibility: "hidden" }}
          aria-label="Front"
        >
          <CardContent className="relative p-6 h-full grid place-items-center">
            <h1 className="font-serif font-bold text-[color:var(--card-theme)] leading-tight text-left text-[clamp(1.2rem,4.6vw,2rem)] whitespace-nowrap">
              DELAN REMEMBER HER
            </h1>

            {showArrows && (
              <div
                className="absolute bottom-2 right-2 grid place-items-center gap-1 pointer-events-none"
                style={{ maxWidth: "45%" }}
              >
                <svg
                  style={{ width: "clamp(40px,12vw,90px)" }}
                  viewBox="0 0 150 90"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="animate-bounce"
                >
                  <path
                    d="M149 45C149 45 120.364 12.3571 85 1C49.6364 -10.3571 1 45 1 45M149 45C149 45 120.364 77.6429 85 89C49.6364 100.357 1 45 1 45M149 45H1"
                    stroke="#E8A0A3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x="50"
                    y="48"
                    fontFamily="Georgia, serif"
                    fontSize="20"
                    fill={theme}
                    fontWeight="bold"
                  >
                    FLIP!
                  </text>
                </svg>
              </div>
            )}
            <div className="">
              <PrBanner/>
            </div>
          </CardContent>
        </Card>

        {/* BACK */}
        <Card
          className={[
            "absolute inset-0 rounded-2xl shadow-sm",
            "bg-[color:var(--card-back)] [transform:rotateY(180deg)] [backface-visibility:hidden]",
          ].join(" ")}
          style={{ WebkitBackfaceVisibility: "hidden" }}
          aria-label="Back"
        >
          <CardContent className="relative p-6 h-full grid place-items-center">
            <h5 className="text-center text-[color:var(--card-theme)] font-serif leading-relaxed max-w-[58ch] text-[clamp(0.92rem,2.2vw,1.12rem)]">
              {backText}
            </h5>

            {showArrows && (
              <div
                className="absolute bottom-2 right-2 grid place-items-center gap-1 pointer-events-none"
                style={{ maxWidth: "50%" }}
              >
                <p className="text-[color:var(--card-theme)] text-[clamp(0.66rem,1.7vw,0.86rem)] leading-tight m-0">
                  BACK
                </p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8A0A3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="animate-bounce"
                >
                  <path d="M2 12a10 10 0 1 0 4-8" />
                  <polyline points="2 2 2 8 8 8" />
                </svg>
                <p className="text-[color:var(--card-theme)] text-[clamp(0.66rem,1.7vw,0.86rem)] leading-tight m-0">
                  FLIP AGAIN!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* --------- helpers --------- */
function getPointX(e) {
  if ("clientX" in e) return e.clientX;
  // @ts-ignore
  if (e.changedTouches?.[0]?.clientX != null) return e.changedTouches[0].clientX;
  return null;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!m.matches);
    update();
    m.addEventListener?.("change", update);
    return () => m.removeEventListener?.("change", update);
  }, []);
  return reduced;
}
