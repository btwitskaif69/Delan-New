// src/components/StickyNav.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Categories",   targetId: "categories-section" },
  { label: "Bestsellers",  targetId: "top-products-section" },
  { label: "Trousers",     targetId: "trousers-section" },
  { label: "Short Dress",  targetId: "short-dresses-section" },
  { label: "Maxi & Midi",  targetId: "maxi-midi-dress-section" },
  { label: "Co-ords",      targetId: "co-ords-section" },
  { label: "Reviews",      targetId: "reviews-section" },
];

const BRAND = "#642c44";

export default function StickyNav({
  headerHeight = 64,  // your fixed site header height
  stickyGap = 60,     // visual gap below the header
  extraOffset = 0,    // tweak if you need a bit more/less
}) {
  const [active, setActive] = useState(NAV_ITEMS[0]?.targetId);
  const navRef = useRef(null);

  const vars = useMemo(
    () => ({
      "--header-height": `${headerHeight}px`,
      "--sticky-gap": `${stickyGap}px`,
    }),
    [headerHeight, stickyGap]
  );

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navH = navRef.current?.offsetHeight ?? 0;
    const totalOffset = headerHeight + stickyGap + navH + extraOffset;
    const y =
      el.getBoundingClientRect().top + window.scrollY - Math.max(0, totalOffset);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    const sections = NAV_ITEMS
      .map((n) => document.getElementById(n.targetId))
      .filter(Boolean);

    if (!sections.length) return;

    const navH = navRef.current?.offsetHeight ?? 0;
    const topOffset = headerHeight + stickyGap + navH;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      {
        root: null,
        rootMargin: `-${topOffset + 8}px 0px -60% 0px`,
        threshold: 0.01,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [headerHeight, stickyGap]);

  return (
    <nav
      ref={navRef}
      className="  w-full border-b
        bg-white py-6"

      aria-label="Section navigation"
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.targetId;
          return (
            <Button
              key={item.targetId}
              type="button"
              onClick={() => scrollToId(item.targetId)}
              size="sm"
              variant={isActive ? "default" : "outline"}
              className="rounded-md whitespace-nowrap transition-colors"
              style={
                isActive
                  ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                  : { borderColor: BRAND, color: BRAND }
              }
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}