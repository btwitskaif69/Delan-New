"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

// Replace these with your actual SVG logo imports
import Forbes from "@/assets/logos/forbes.svg";
import Vogue from "@/assets/logos/vogue.svg";
import Cosmopolitan from "@/assets/logos/cosmopolitan.svg";
import Cnbc from "@/assets/logos/cnbc.svg";

/* -------- Solid star overlay for visible fill -------- */
function SolidStar({ className = "", style }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <polygon
        points="12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------------- Logos ---------------- */
const LOGOS = [
  { name: "Forbes India", alt: "Forbes India", logo: Forbes },
  { name: "Vogue", alt: "Vogue", logo: Vogue },
  { name: "Cosmopolitan", alt: "Cosmopolitan", logo: Cosmopolitan },
  { name: "CNBC TV18", alt: "CNBC TV18", logo: Cnbc },
];

const LogoSet = ({ ariaHidden = false }) => (
  <ul className="flex w-1/2 items-center justify-around" aria-hidden={ariaHidden || undefined}>
    {LOGOS.map((mp, i) => (
      <li
        key={`${mp.name}-${i}-${ariaHidden ? "b" : "a"}`}
        className="flex-none h-20 w-36 flex items-center justify-center"
        title={mp.name}
      >
        <img src={mp.logo} alt={mp.alt} className="max-h-10 w-auto object-contain" loading="lazy" />
      </li>
    ))}
  </ul>
);

export default function PrBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    // Customers counter
    const customerTarget = 100000;
    const customerIncrement = customerTarget / 100;
    let customerCurrent = 0;
    const customerTimer = setInterval(() => {
      customerCurrent += customerIncrement;
      if (customerCurrent >= customerTarget) {
        customerCurrent = customerTarget;
        clearInterval(customerTimer);
      }
      setCustomerCount(Math.floor(customerCurrent));
    }, 20);

    // Reviews counter
    const reviewTarget = 5000;
    const reviewIncrement = reviewTarget / 80;
    let reviewCurrent = 0;
    const reviewTimer = setInterval(() => {
      reviewCurrent += reviewIncrement;
      if (reviewCurrent >= reviewTarget) {
        reviewCurrent = reviewTarget;
        clearInterval(reviewTimer);
      }
      setReviewCount(Math.floor(reviewCurrent));
    }, 25);

    return () => {
      clearInterval(customerTimer);
      clearInterval(reviewTimer);
    };
  }, []);

  const formatNumber = (num) => {
    if (num >= 100000) return `${(num / 100000).toFixed(0)},00,000+`;
    return num.toLocaleString();
  };

  return (
    <div className="w-full bg-muted/30 overflow-hidden">
      <div className="max-w-8xl mx-auto">

        {/* Customer Stats + Stars */}
        <div
          className={`text-center mb-12 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "250ms" }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h3 className="text-3xl md:text-4xl font-bold text-primary montserrat-700 uppercase">
              {formatNumber(customerCount)} Satisfied Customers
            </h3>

            {/* Stars: stroke base + solid overlay with looping left→right wipe */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="relative inline-block w-6 h-6">
                  {/* Base outline */}
                  <Star className="w-6 h-6 text-gray-300" />

                  {/* Overlay fill (animated) */}
                  <span
                    className="absolute left-0 top-0 h-full overflow-hidden pointer-events-none z-10 star-fill-animation"
                    style={{
                      animationDelay: `${i * 100}ms`,
                      willChange: "width",
                      transform: "translateZ(0)",
                    }}
                    aria-hidden="true"
                  >
                    <SolidStar className="w-6 h-6 text-yellow-400" />
                  </span>
                </span>
              ))}
              <span className="ml-2 text-3xl md:text-4xl font-bold text-primary montserrat-700 uppercase">
                ({reviewCount.toLocaleString()}+)
              </span>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative group overflow-hidden bg-accent py-5">
          {/* Edge fades */}

          {/* Track: exactly 200% width, two identical halves */}
          <div
            className="flex w-[200%] marquee-track"
            style={{ ["--marquee-duration"]: "22s" }}
          >
            <LogoSet />
            <LogoSet ariaHidden />
          </div>
        </div>
      </div>

      {/* Self-contained CSS: marquee + star animation */}
      <style jsx>{`
        .marquee-track {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-duration: var(--marquee-duration, 22s);
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .star-fill-animation {
          animation: starFillSequence 3s ease-in-out infinite;
          width: 0%;
        }
        @keyframes starFillSequence {
          0%   { width: 0%; }
          25%  { width: 100%; }
          75%  { width: 100%; }
          76%  { width: 0%; }
          100% { width: 0%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track, .star-fill-animation { animation: none !important; }
          .star-fill-animation { width: 100%; }
        }
      `}</style>
    </div>
  );
}
