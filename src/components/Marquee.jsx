// src/components/Marquee.jsx
import React from "react";
import { Badge } from "@/components/ui/badge";

const BRAND = "var(--brand-642, #642c44)";

const DEFAULT_ITEMS = [
  "✨ 10% Off for New Customers ✨",
  "⚡️ Extra 20% for Returning Shoppers ⚡",
  "💎 Exclusive Perks for Loyal Delan Women 💎",
  "✨ Free Returns & Easy Exchanges ✨",
  "🌸 Timeless Luxury · Premium Quality 🌸",
  "✨ Effortless Elegance, Made in India ✨",
  "💎 Chic Co-ords, Skirts & Western Wear 💎",
  "✨ Crafted for Confidence & Individuality ✨",
];

export default function Marquee({
  items = DEFAULT_ITEMS,
  speed = 35,          // seconds for one full loop
  gap = "1.25rem",     // space between badges
  pauseOnHover = true, // pauses animation on hover
}) {
  // Make two copies for seamless loop
  const lane = [...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden border-b bg-accent"

      role="region"
      aria-label="Store promotions"
    >
      {/* Group to allow pause-on-hover via Tailwind arbitrary property */}
      <div
        className={`group mx-auto max-w-[1400px] px-3 py-2 sm:px-6`}
        style={{ ["--dur"]: `${speed}s`, ["--gap"]: gap }}
      >
        {/* Lane */}
        <div
          className={[
            "flex w-max items-center",
            "motion-reduce:animate-none",
          ].join(" ")}
          style={{
            gap: `var(--gap)`,
            animation: `marquee var(--dur) linear infinite`,
            willChange: "transform",
            ...(pauseOnHover ? { ["--paused"]: "paused" } : {}),
          }}
        >
          {lane.map((text, i) => (
            <Badge
              key={`${text}-${i}`}
              className="whitespace-nowrap text-[13px] sm:text-sm text-black font-regular bg-accent px-3 py-1"
            >
              {text}
            </Badge>
          ))}
        </div>

        {/* Pause on hover (via arbitrary property) */}
        {pauseOnHover && (
          <style>{`
            .group:hover > div[style*="marquee"] { animation-play-state: paused; }
          `}</style>
        )}
      </div>

      {/* Keyframes (scopes to this file) */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes marquee { from { transform: none; } to { transform: none; } }
        }
      `}</style>
    </div>
  );
}
