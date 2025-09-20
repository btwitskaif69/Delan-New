// src/components/UspShowcase.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";

import Crafted from "@/assets/images/11.png";
import Uncompromised from "@/assets/images/22.png";
import Sustainable from "@/assets/images/33.png";
import Elegant from "@/assets/images/44.png";
import Comfort from "@/assets/images/55.png";

export default function UspShowcase() {
  /** @type {React.MutableRefObject<HTMLDivElement|null>} */
  const componentRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const usps = [
    {
      title: "Crafted from 100% natural fabrics",
      description:
        "Experience the pure comfort and breathability of materials sourced directly from nature, ensuring a soft touch on your skin and a clear conscience.",
      image: Crafted,
    },
    {
      title: "Uncompromised quality at fair prices",
      description:
        "We believe luxury should be accessible. Our direct-to-consumer model eliminates middlemen, allowing us to offer premium garments without the premium price tag.",
      image: Uncompromised,
    },
    {
      title: "Sustainable fashion for conscious living",
      description:
        "From ethical sourcing to eco-friendly packaging, every step of our process is designed to minimize our environmental footprint and promote a healthier planet.",
      image: Sustainable,
    },
    {
      title: "Elegant designs, timeless everyday wear",
      description:
        "Our collections are thoughtfully designed to be both beautiful and versatile, creating staple pieces that you will cherish and wear for years to come.",
      image: Elegant,
    },
    {
      title: "Comfort, style, and responsibility combined",
      description:
        "You no longer have to choose. Our brand is a promise of clothing that looks good, feels good, and does good for the world.",
      image: Comfort,
    },
  ];

  // Track viewport for mobile tweaks
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Scroll-driven step detection (kept simple & lightweight)
  useEffect(() => {
    const handleScroll = () => {
      const node = componentRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const height = rect.height;
      const scrollOffset = window.innerHeight * 0.5;
      const scrollPosition = window.scrollY + scrollOffset;
      const componentTop = node.offsetTop;

      const progress = scrollPosition - componentTop;
      const sectionHeight = height / usps.length;
      const idx = Math.min(
        usps.length - 1,
        Math.max(0, Math.floor(progress / sectionHeight))
      );
      setActiveIndex(idx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [usps.length]);

  const imageStyleFor = (index) => {
    const total = usps.length;
    const relativeIndex = (index - activeIndex + total) % total;

    // On mobile: show only the active image; hide others
    if (isMobile) {
      return relativeIndex === 0
        ? { opacity: 1, transform: "scale(1)", zIndex: 10 }
        : { opacity: 0, transform: "scale(0.9)", zIndex: 0 };
    }

    // Desktop layering
    if (relativeIndex === 0) {
      return {
        opacity: 1,
        transform: "translate(0, 0) scale(1)",
        zIndex: 30,
        filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.25))",
      };
    } else if (relativeIndex === 1) {
      return {
        opacity: 0.75,
        transform: "translate(-110px, 150px) scale(0.82)",
        zIndex: 20,
        filter: "blur(2px)",
      };
    } else if (relativeIndex === total - 1) {
      return {
        opacity: 0.55,
        transform: "translate(-110px, -150px) scale(0.82)",
        zIndex: 10,
        filter: "blur(3px)",
      };
    }
    return { opacity: 0, transform: "scale(0.7)", zIndex: 0 };
  };

  return (
    <section
      ref={componentRef}
      className="
        bg-white font-[var(--font-primary)]
        flex flex-col md:flex-row
        min-h-[220vh] md:min-h-[350vh]
      "
    >
      {/* Images panel */}
      <div
        className="
          w-full md:w-1/2
          md:sticky md:top-0
          h-[56vh] md:h-screen
          flex items-center justify-center
          overflow-hidden px-4 md:px-0
        "
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {usps.map((usp, i) => (
            <img
              key={i}
              src={usp.image}
              alt={usp.title}
              loading="lazy"
              className="
                absolute object-contain
                transition-all duration-700 ease-in-out
                max-w-[85%] md:max-w-[60%]
              "
              style={imageStyleFor(i)}
              draggable="false"
            />
          ))}
        </div>
      </div>

      {/* Text panel */}
      <div
        className="
          w-full md:w-1/2
          md:sticky md:top-0
          h-auto md:h-screen
          flex flex-col
          justify-start
          px-4 md:px-0
          pt-8 md:pt-[30vh]
          pb-12 md:pb-10
        "
      >
        {/* Desktop: layered absolute slides */}
        <div className="relative hidden md:block max-w-[520px] pr-20 flex-1 leading-relaxed">
          {usps.map((usp, i) => (
            <div
              key={i}
              className={[
                "absolute w-[420px] transition-all duration-500",
                i === activeIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5",
              ].join(" ")}
            >
              <h2 className="text-3xl lg:text-[2.5rem] font-semibold mb-4 whitespace-normal">
                {usp.title}
              </h2>
              <p className="text-base lg:text-xl text-[#a64d79] mb-5 leading-7 lg:leading-8">
                {usp.description}
              </p>

              <Link
                to="/collections/dresses"
                className={[
                  buttonVariants?.({ variant: "default" }) ?? "",
                  "rounded-full bg-[#a64d79] hover:bg-[#94456d] text-white px-6 py-2",
                  "uppercase tracking-[0.08em] text-[13px] lg:text-[14px]",
                  "shadow-[0_8px_22px_rgba(166,77,121,0.25)] hover:shadow-[0_12px_28px_rgba(166,77,121,0.30)]",
                  "transition-all inline-flex items-center gap-2",
                ].join(" ")}
              >
                View Collection <span>→</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile/Tablet: single active slide in normal flow */}
        <div className="md:hidden max-w-[720px] mx-auto leading-relaxed">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
            {usps[activeIndex].title}
          </h2>
          <p className="text-[15px] sm:text-base text-[#a64d79] mb-4 leading-7">
            {usps[activeIndex].description}
          </p>
          <Link
            to="/collections/dresses"
            className={[
              buttonVariants?.({ variant: "default" }) ?? "",
              "rounded-full bg-[#a64d79] hover:bg-[#94456d] text-white px-5 py-2",
              "uppercase tracking-[0.08em] text-[12px] sm:text-[13px]",
              "shadow-[0_8px_22px_rgba(166,77,121,0.25)] hover:shadow-[0_12px_28px_rgba(166,77,121,0.30)]",
              "transition-all inline-flex items-center gap-2",
            ].join(" ")}
          >
            View Collection <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
