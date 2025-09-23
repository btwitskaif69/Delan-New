// src/components/FlippingCard.jsx
import React, { useState, useCallback } from "react";
// Adjust this path to wherever your image actually lives:
import banner from "@/assets/images/flip-banner.png";

export default function FlippingCard() {
  const [flipped, setFlipped] = useState(false);

  const toggle = useCallback(() => setFlipped((f) => !f), []);
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <section className="px-[5%] py-12">
      <div
        className="mx-auto max-w-6xl"
        role="button"
        tabIndex={0}
        aria-pressed={flipped ? "true" : "false"}
        aria-label={flipped ? "Flip back" : "Tap to flip"}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <div className="relative w-full [perspective:1200px]">
          <div
            className={`relative h-[420px] md:h-[550px] w-full rounded-2xl shadow-xl transition-transform duration-700 ease-out [transform-style:preserve-3d] ${
              flipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* FRONT: Banner image */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
              <img
                src={banner}
                alt="Delan fashion banner"
                className="h-full w-full object-cover"
                draggable="false"
                loading="lazy"
                decoding="async"
              />
              {/* Subtle “Tap to flip” overlay */}
<div
  className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4 md:pb-6"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
>
  <span className="select-none px-5 py-10 text-primary text-lg font-semibold">
    Tap to flip
  </span>
</div>
            </div>

            {/* BACK: Text only */}
{/* BACK: Text only (centered + enhanced) */}
<div className="absolute inset-0 overflow-hidden rounded-2xl bg-accent
                [backface-visibility:hidden] [transform:rotateY(180deg)]
                bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_60%)]">
  <div className="flex h-full items-center justify-center p-6 md:p-10">
    <div className="max-w-2xl md:max-w-4xl text-center text-primary">
      {/* Soft opening mark for a premium feel */}
      <div className=" text-4xl md:text-5xl leading-none text-primary/20 select-none">“</div>

      <p className="font-secondary text-base md:text-lg lg:text-xl leading-relaxed md:leading-8">
        Finding clothes that show who you really are, while lasting beyond quick fashion trends feels impossible.
      </p>

      <p className="mt-4 font-secondary text-base md:text-lg lg:text-xl leading-relaxed md:leading-8">
        For 25 years, <span className="font-semibold">Delan</span> has helped modern women solve this problem with perfectly fitted pieces made from beautiful,
        long-lasting fabrics that never go out of style.
      </p>

      <p className="mt-4 font-secondary text-base md:text-lg lg:text-xl leading-relaxed md:leading-8">
        <span className="font-semibold">We don’t just make clothes, we create confidence.</span>
      </p>

      <p className="mt-4 font-secondary text-base md:text-lg lg:text-xl leading-relaxed md:leading-8">
        When you wear Delan, you’re not copying others. You’re showing the world who you are. Own it{" "}
        <span className="font-semibold">#TrustYourStyle</span>
      </p>

      {/* Flip instruction (bottom-center) */}
      <div
        className="pointer-events-none mt-8 text-xs md:text-sm text-primary/60 flex items-end justify-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <span className="hidden sm:inline">Click anywhere to flip back</span>
        <span className="sm:hidden">Tap anywhere to flip back</span>
      </div>
    </div>
  </div>
</div>

            {/* /BACK */}
          </div>
        </div>
      </div>
    </section>
  );
}
