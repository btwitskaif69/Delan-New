import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Model } from "@/components/Model";
import { useWindowSize } from "@/hooks/useWindowSize";

/* USP positions (desktop) */
const uspsDesktop = [
  { text: "Like every piece is designed just for you.", position: { top: "20%", left: "25%" } },
  { text: "Comfort that hugs, style that truly stays.", position: { top: "20%", left: "72%" } },
  { text: "A wardrobe choice you’ll never regret making.", position: { top: "60%", left: "25%" } },
  { text: "Outfits that vibe with every mood and moment.", position: { top: "60%", left: "72%" } },
  { text: "Quality that speaks before you even say a word.", position: { top: "80%", left: "50%" } },
];

/* USP positions (mobile) – centered stack */
const uspsMobile = [
  { text: "Like every piece is designed just for you.", position: { top: "20%", left: "50%" } },
  { text: "Comfort that hugs, style that truly stays.", position: { top: "35%", left: "50%" } },
  { text: "A wardrobe choice you’ll never regret making.", position: { top: "50%", left: "50%" } },
  { text: "Outfits that vibe with every mood and moment.", position: { top: "65%", left: "50%" } },
  { text: "Quality that speaks before you even say a word.", position: { top: "80%", left: "50%" } },
];

function UspItem({ usp, index, scrollYProgress }) {
  const start = index * 0.2;
  const end = start + 0.2;
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [20, 0]);

  return (
<motion.div
  style={{ top: usp.position.top, left: usp.position.left, opacity, y }}
  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
>
  <Card
    className="border-0 shadow-none 
               bg-white/10 backdrop-blur-xs 
               sm:bg-transparent sm:backdrop-blur-none py-0!"
  >
    <CardContent className="px-5 py-3">
      <p className="montserrat-500 text-center text-sm md:text-base text-primary font-semibold">
        {usp.text}
      </p>
    </CardContent>
  </Card>
</motion.div>

  );
}

export default function InteractiveModelSection({ nextSectionRef }) {
  const sectionRef = useRef(null);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const usps = isMobile ? uspsMobile : uspsDesktop;
  const cameraPosition = isMobile ? [0, 0, 8] : [0, 0, 6.5];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Model anims
  const modelRotation = useTransform(scrollYProgress, [0, 1], [0, 2 * Math.PI]);
  const modelScale = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1.08, 0.98]);
  const modelYOffset = useTransform(scrollYProgress, [0, 1], [0.0, -0.15]);

  // Heading fade (NO vertical movement so it stays pinned)
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5], [1, 0.7, 0.35]);

  // Auto-advance near end
  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      if (v >= 0.98 && nextSectionRef?.current) {
        nextSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [scrollYProgress, nextSectionRef]);

  return (
    <section ref={sectionRef} className="relative h-[400vh]">
      {/* Sticky stage wraps EVERYTHING; set `relative` so absolute kids anchor here */}
      <div className="sticky top-0 h-screen w-full overflow-hidden touch-pan-y">
        {/* ✅ Heading is absolute inside the same sticky stage, so it doesn't slide */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[5%] z-30 w-[92%] max-w-4xl -translate-x-1/2 text-center text-primary"
        >
          <h2 className="font-primary cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl font-bold">
            Why Delan Feels Like You
          </h2>
          <p className="montserrat-500 text-sm md:text-lg">
            Because fashion should vibe with your story.
          </p>
        </motion.div>

        {/* 3D Canvas */}
        <Canvas
          camera={{ position: cameraPosition, fov: 50 }}
          className="h-full w-full"
          style={{
            pointerEvents: isMobile ? "none" : "auto",
            touchAction: isMobile ? "pan-y" : "auto",
          }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <Model modelRotation={modelRotation} modelScale={modelScale} modelYOffset={modelYOffset} />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>

        {/* USP chips */}
        {usps.map((usp, i) => (
          <UspItem key={i} usp={usp} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
