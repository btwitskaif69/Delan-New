"use client";

import React from "react";

// Logo assets
import forbes from "@/assets/logos/forbes.svg";
import vogue from "@/assets/logos/vogue.svg";
import cosmopolitan from "@/assets/logos/cosmopolitan.svg";
import cnbc from "@/assets/logos/cnbc.svg";

// Outlined star (gold stroke, no fill)
const OutlineStar = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3.5l2.92 5.92 6.53.95-4.72 4.6 1.11 6.47L12 18.9 6.16 21.44l1.11-6.47-4.72-4.6 6.53-.95L12 3.5z"
      stroke="#F5C543"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PrBanner({ className = "" }) {
  return (
    <section className={["w-full", className].join(" ")} aria-label="Press & awards banner">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
        <div className="overflow-hidden rounded-2xl">
          {/* Headline + stars */}
          <div className="px-3 sm:px-6 pt-5">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-center">
              <h3 className="font-serif font-semibold text-neutral-900 leading-tight text-[clamp(1rem,3.4vw,1.75rem)]">
                1,00,000+ <span className="whitespace-nowrap">Satisfied Customers</span>
              </h3>

              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="flex items-center gap-[2px]" aria-hidden="true">
                  <OutlineStar />
                  <OutlineStar />
                  <OutlineStar />
                  <OutlineStar />
                  <OutlineStar />
                </div>
                <span className="text-[clamp(0.85rem,2.2vw,1rem)] text-neutral-600">(5000+)</span>
                <span className="sr-only">Five star rating from over five thousand reviews</span>
              </div>
            </div>
          </div>

          {/* Logos & award — perfectly centered, consistent heights */}
          <div className="px-3 sm:px-6 pb-5 sm:pb-6 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-10">
              {/* Each logo sits in a fixed-height box to align baselines */}
              <div className="h-5 sm:h-10 md:h-8 flex items-center">
                <img
                  src={forbes}
                  alt="Forbes India"
                  className="block h-full w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="h-5 sm:h-10 md:h-8 flex items-center">
                <img
                  src={vogue}
                  alt="Vogue India"
                  className="block h-full w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="h-5 sm:h-10 md:h-8 flex items-center">
                <img
                  src={cosmopolitan}
                  alt="Cosmopolitan India"
                  className="block h-full w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* CNBC + award block */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
                <div className="h-5 sm:h-10 md:h-8 flex items-center">
                  <img
                    src={cnbc}
                    alt="CNBC TV18"
                    className="block h-full w-auto object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* divider only when space allows */}
                <div className="hidden md:block h-8 w-px bg-neutral-300/80" />

                <div className="text-left leading-tight min-w-0">
                  <div className="text-[11px] sm:text-[12px] md:text-[13px] text-neutral-600 truncate">
                    India Business Leader Awards 2024
                  </div>
                  <div className="text-[12px] sm:text-[13px] md:text-[15px] font-semibold text-neutral-900">
                    Breakout Brand Of The Year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
