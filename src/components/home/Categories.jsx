// src/components/Categories.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import WARDROBE from "@/assets/images/7.jpeg";
import TABLE from "@/assets/images/666.png";
import EVENT from "@/assets/images/111.png";
import FESTIVE from "@/assets/images/122.png";

const BRAND = "var(--brand-642, #642c44)";

export default function Categories() {
  const categories = useMemo(
    () => [
      { name: "THE 9-TO-5 WARDROBE", img: WARDROBE, handle: "maxi-midi-dress" },
      { name: "FOR A TABLE FOR TWO", img: TABLE, handle: "maxi-midi-dress" },
      { name: "THE MAIN EVENT", img: EVENT, handle: "short-dress" },
      { name: "THE FESTIVE CHAPTER", img: FESTIVE, handle: "co-ords" },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const nextIndex = (activeIndex + 1) % categories.length;
  const nextNextIndex = (activeIndex + 2) % categories.length;

  return (
    <section id="categories-section" className="bg-white px-[5%] py-12">
      {/* Heading */}
      <h2 className="text-center font-primary text-[clamp(1.5rem,3.2vw,2.4rem)] font-semibold text-[color:var(--brand-642,#642c44)] mb-8">
        Our Curated Collection
      </h2>

      {/* Layout: desktop → 3 columns / mobile → stacked with list above image */}
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(320px,1fr)_minmax(420px,560px)_minmax(220px,1fr)]">
        {/* LEFT: Vertical list (desktop). On mobile we render a *separate* centered list above image */}
        <div className="hidden lg:block self-center">
          <nav aria-label="Curated categories" className="flex flex-col gap-6">
            {categories.map((cat, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={cat.name}
                  to={`/collections/${cat.handle}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  className="group block"
                >
                  <span
                    className={[
                      "font-primary uppercase",
                      // big serif like screenshot
                      "text-[clamp(1.6rem,2.4vw,1rem)] leading-tight",
                      "tracking-[0.06em]",
                      isActive
                        ? "text-[color:var(--brand-642,#642c44)]"
                        : "text-neutral-300 hover:text-neutral-400 transition-colors",
                    ].join(" ")}
                  >
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CENTER: Main preview with two blurred previews (desktop only) */}
        <div className="relative">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="relative">
                {/* Main image */}
                <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={categories[activeIndex].name}
                      src={categories[activeIndex].img}
                      alt={categories[activeIndex].name}
                      className="h-full w-full select-none object-contain lg:object-contain"
                      draggable="false"
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, scale: 0.94, y: 32 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.04, y: -32 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                </AspectRatio>

                {/* Blurred previews (desktop only, sit to the right like your mock) */}
                <div className="pointer-events-none absolute inset-0 hidden lg:block">
                  {/* next */}
                  <div className="absolute right-[-12%] top-[22%] h-[38%] w-[26%] overflow-hidden rounded-xl opacity-70 blur-[2px]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={categories[nextIndex].name + "-next"}
                        src={categories[nextIndex].img}
                        alt=""
                        className="h-full w-full object-contain"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.45 }}
                      />
                    </AnimatePresence>
                  </div>

                  {/* next-next */}
                  <div className="absolute right-[-20%] bottom-[6%] h-[40%] w-[28%] overflow-hidden rounded-xl opacity-60 blur-[4px]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={categories[nextNextIndex].name + "-next-next"}
                        src={categories[nextNextIndex].img}
                        alt=""
                        className="h-full w-full object-contain"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                      />
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: spacer to keep center perfectly centered on desktop */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* MOBILE/TABLET LIST — centered big serif, stacked like your phone screenshot */}
        <div className="lg:hidden col-span-full">
          <nav
            aria-label="Curated categories (mobile)"
            className="flex flex-col items-center gap-6"
          >
            {categories.map((cat, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={cat.name}
                  to={`/collections/${cat.handle}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  className="group"
                >
                  <span
                    className={[
                      "font-primary uppercase text-center",
                      // big type that scales nicely on small screens
                      "text-[clamp(1.25rem,7vw,2rem)] leading-tight",
                      "tracking-[0.06em]",
                      isActive
                        ? "text-[color:var(--brand-642,#642c44)]"
                        : "text-neutral-300 hover:text-neutral-400 transition-colors",
                    ].join(" ")}
                  >
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Extra spacing before the image on mobile like your mock */}
          <div className="mt-6">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={categories[activeIndex].name + "-m"}
                      src={categories[activeIndex].img}
                      alt={categories[activeIndex].name}
                      className="h-full w-full select-none object-contain"
                      draggable="false"
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, scale: 0.96, y: 24 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.03, y: -24 }}
                      transition={{ duration: 0.55, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                </AspectRatio>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
