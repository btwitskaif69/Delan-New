// src/components/HeroSlider.jsx
import React, { useEffect, useMemo, useState } from "react";

// ✅ import both images from assets
import hero1 from "@/assets/images/hero1.png";
import hero2 from "@/assets/images/hero2.png";

// build the slider array from assets
const sliderImages = [hero1, hero2];

function useIsMdUp() {
  const [isMdUp, setIsMdUp] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsMdUp(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return isMdUp;
}

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMdUp = useIsMdUp();

  // Rotate images only on md+ (desktop/tablet)
  useEffect(() => {
    if (!isMdUp) return;
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isMdUp]);

  const ariaProps = useMemo(
    () => ({
      role: "region",
      "aria-label": "Hero slider",
      "aria-roledescription": "carousel",
      "aria-live": "polite",
    }),
    []
  );

  return (
    <div
      {...ariaProps}
      className="
        relative w-full overflow-hidden bg-neutral-100
        h-[80vh] md:h-[70vh] lg:h-[90vh]
      "
    >
      {/* Mobile (≤ md): video */}
      <video
        key="hero-mobile-video"
        className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
        src="/videos/hero.mp4"   // keep or swap to an asset pipeline video if you like
        playsInline
        muted
        autoPlay
        loop
        preload="metadata"
        poster={hero1}           // ✅ poster from assets
        aria-label="Hero video"
      />

      {/* md+ : cross-fading images */}
      <div className="hidden md:block">
        {sliderImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Slide ${index + 1}`}
            className={[
              "absolute inset-0 h-full w-full object-cover object-center",
              "opacity-0 transition-opacity duration-[1500ms] ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0",
            ].join(" ")}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            sizes="100vw"
          />
        ))}
      </div>
    </div>
  );
}
