// src/components/AvailBanner.jsx
import React from "react";
import ajio from "@/assets/logos/ajio.svg";
import amazon from "@/assets/logos/amazon.svg";
import flipkart from "@/assets/logos/flipkart.svg";
import meesho from "@/assets/logos/meesho.svg";
import myntra from "@/assets/logos/myntra.svg";

const MARKETPLACES = [
  { src: myntra,   alt: "Myntra" },
  { src: amazon,   alt: "Amazon" },
  { src: flipkart, alt: "Flipkart" },
  { src: ajio,     alt: "AJIO" },
  { src: meesho,   alt: "Meesho" },
];

export default function AvailBanner({
  title = "AVAILABLE ON",
  speed = 25000,          // ms for one full cycle (lower = faster)
  direction = "left",     // "left" or "right"
  gap = 40,               // px gap between logos
  logoHeight = 36,        // px height for the logos
  className = "",
  // gapClass is no longer needed for perfect looping, but kept for compatibility
}) {
  const animationDirection = direction === "right" ? "reverse" : "normal";

  // Build a segment and duplicate it to guarantee identical widths (seamless loop)
  const Segment = ({ ariaHidden = false }) => (
    <div className="marquee-segment flex items-center" aria-hidden={ariaHidden ? "true" : undefined}>
      {MARKETPLACES.map((m, i) => (
        <Logo
          key={`${m.alt}-${i}-${ariaHidden ? "dup" : "org"}`}
          src={m.src}
          alt={ariaHidden ? "" : m.alt}
          height={logoHeight}
          gap={gap}
        />
      ))}
    </div>
  );

  return (
    <section
      className={`relative overflow-hidden bg-accent py-6 ${className}`}
      role="region"
      aria-label="Available on marketplaces"
      style={{
        // Subtle edge fade (browsers that don't support mask will ignore gracefully)
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      {/* Heading */}
      <h3 className="text-center text-primary font-secondary tracking-[0.12em] text-xs md:text-sm font-semibold">
        {title}
      </h3>

      {/* Marquee wrapper */}
      <div className="group relative mt-4">
        {/* Edge overlays (for non-mask browsers & extra polish) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-24 bg-gradient-to-r from-accent to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-24 bg-gradient-to-l from-accent to-transparent" />

        {/* Track: two identical segments */}
        <div
          className="marquee-track flex w-max items-center will-change-transform"
          style={{
            animation: `marquee ${speed}ms linear infinite`,
            animationDirection,
          }}
        >
          <Segment />
          <Segment ariaHidden />
        </div>
      </div>

      {/* Local styles */}
      <style>{`
        /* Ensure each segment doesn't flex-stretch and spacing is consistent */
        .marquee-segment { flex: 0 0 auto; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* exactly one segment width */
        }

        /* Pause on hover */
        .group:hover .marquee-track { animation-play-state: paused; }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}

function Logo({ src, alt, height, gap }) {
  return (
    <div
      className="opacity-90 transition-all hover:opacity-100"
      style={{ marginRight: `${gap}px` }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable="false"
        style={{ height: `${height}px`, width: "auto" }}
        className="object-contain"
      />
    </div>
  );
}
