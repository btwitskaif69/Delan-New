// src/components/StatsCounter.jsx
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  { id: 1, label: "Happy Customers", target: 10, suffix: "L+" },
  { id: 2, label: "Styles Purchased", target: 3, suffix: "M+" },
  { id: 3, label: "Offline Stores Near You", target: 15, suffix: "" },
];

// simple ease-out (smoother than linear)
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function useCountUp(target, run, duration = 2000) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start = 0;

    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(easeOut(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);

  return val;
}

export default function StatsCounter() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // run once when ~30% of block is visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const StatItem = ({ label, target, suffix }) => {
    const count = useCountUp(target, visible);
    return (
      <Card className="w-full bg-card-none shadow-none border-none">
        <CardContent className="px-6 py-4 text-center">
          <h3
            className="montserrat-600 text-5xl md:text-5xl font-medium text-primary leading-none"
            aria-live="polite"
          >
            {count.toLocaleString()}
            {suffix}
          </h3>
          <p className="montserrat-500 mt-3 text-xs tracking-widest uppercase text-neutral-600">
            {label}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <section>
      {/* Intro */}
      <div className="mx-auto max-w-[960px] px-4 text-center text-primary">
        <h1 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl">
          The Delan Essence
        </h1>
        <p className="montserrat-500 mx-auto mt-3 max-w-[60ch] text-[clamp(0.95rem,1.2vw,1.05rem)] leading-relaxed text-primary">
          From timeless co-ord sets to empowering silhouettes, we’ve reimagined what modern fashion means for women.
          Across India, women aren’t just wearing Delan—they’re expressing confidence, embracing individuality, and
          shaping their own stories with every outfit.
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 py-4">
        <div
          ref={ref}
          className="
            mx-auto max-w-[700px]
            flex flex-col md:flex-row items-stretch justify-center
            gap-6 md:gap-0
            divide-y md:divide-y-0 md:divide-x divide-[rgba(100,44,68,0.2)]
          "
        >
          {STATS.map((s, i) => (
            <div key={s.id} className="w-full md:flex-1 md:px-6 py-2">
              <StatItem {...s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
