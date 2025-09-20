// src/components/HeroSlider.jsx
import React from "react";

// Posters (optional but recommended for quick first paint)
import heroPoster from "@/assets/images/hero1.png";

// Videos
import heroMobile from "@/assets/videos/hero.mp4";
import heroDesktop from "@/assets/videos/hero-laptop.mp4";

export default function HeroSlider() {
  return (
    <div
      role="region"
      aria-label="Hero slider"
      aria-roledescription="carousel"
      aria-live="polite"
      className="
        relative w-full overflow-hidden bg-neutral-100
        h-[80vh] md:h-[70vh] lg:h-[90vh]
      "
    >
      {/* Mobile (≤ md) */}
      <video
        className="absolute inset-0 h-full w-full object-cover object-center md:hidden"
        src={heroMobile}
        playsInline
        muted
        autoPlay
        loop
        preload="metadata"
        poster={heroPoster}
        aria-label="Hero mobile video"
      >
        <source src={heroMobile} type="video/mp4" />
      </video>

      {/* Desktop / Tablet (md+) */}
      <video
        className="hidden md:block absolute inset-0 h-full w-full object-cover object-center"
        src={heroDesktop}
        playsInline
        muted
        autoPlay
        loop
        preload="metadata"
        poster={heroPoster}
        aria-label="Hero desktop video"
      >
        <source src={heroDesktop} type="video/mp4" />
      </video>
    </div>
  );
}
