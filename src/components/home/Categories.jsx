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

// A reusable component for displaying the animated category image
const CategoryImage = ({ category, motionKey, ...props }) => (
  <Card className="border-0 shadow-none">
    <CardContent className="p-0">
      <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={motionKey}
            src={category.img}
            alt={category.name}
            className="h-full w-full select-none object-contain"
            draggable="false"
            loading="lazy"
            decoding="async"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            {...props}
          />
        </AnimatePresence>
      </AspectRatio>
    </CardContent>
  </Card>
);

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
      <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-6">
        Our Curated Collection
      </h2>

      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[minmax(320px,1fr)_minmax(420px,560px)_minmax(220px,1fr)]">
        
        {/* LEFT: Desktop Navigation */}
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
                      "uppercase",
                      "text-lg md:text-2xl leading-tight",
                      "tracking-[0.06em] montserrat-500 uppercase",
                      isActive
                        ? "text-primary"
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

        {/* CENTER: Desktop Image Preview */}
        <div className="relative hidden lg:block">
          <CategoryImage
            category={categories[activeIndex]}
            motionKey={categories[activeIndex].name}
          />
          {/* Blurred previews */}
          <div className="pointer-events-none absolute inset-0">
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
        
        {/* RIGHT: Desktop Spacer */}
        <div className="hidden lg:block" aria-hidden="true" />

        {/* MOBILE/TABLET LAYOUT */}
        <div className="lg:hidden col-span-full space-y-8">
          <nav aria-label="Curated categories (mobile)" className="flex flex-col items-center gap-6">
            {categories.map((cat, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={cat.name}
                  to={`/collections/${cat.handle}`}
                  onClick={() => setActiveIndex(idx)}
                  className="group"
                >
                  <span
                    className={[
                      "font-primary uppercase text-center",
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
          
          {/* Mobile Image Preview */}
          <CategoryImage
            category={categories[activeIndex]}
            motionKey={categories[activeIndex].name + "-m"}
          />
        </div>

      </div>
    </section>
  );
}