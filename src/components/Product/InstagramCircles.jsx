// src/components/InstagramCircles.jsx
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import Video1 from "@/assets/videos/Video1.mp4";
import Video2 from "@/assets/videos/Video2.mp4";
import Video3 from "@/assets/videos/Video3.mp4";
import Video4 from "@/assets/videos/Video4.mp4";
import Video5 from "@/assets/videos/Video5.mp4";

const DEFAULT_ITEMS = [
  { id: 1, videoUrl: Video1, label: "Look 1" },
  { id: 2, videoUrl: Video2, label: "Look 2" },
  { id: 3, videoUrl: Video3, label: "Look 3" },
  { id: 4, videoUrl: Video4, label: "Look 4" },
  { id: 5, videoUrl: Video5, label: "Look 5" },
];

export default function InstagramCircles({
  items = DEFAULT_ITEMS,
  // responsive by default
  size = "clamp(64px, 10vw, 96px)",
  ringWidth = "clamp(2px, 0.5vw, 4px)",
  pauseOnHover = true,
  showLabels = false,
  title = "Instagram looks",
}) {
  const ring =
    "conic-gradient(#f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)";

  return (
    <section
      className="w-full"
      role="region"
      aria-label={title}
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6">
        <div
          className="no-scrollbar flex items-start gap-3 sm:gap-4 overflow-x-auto py-1 md:flex-wrap md:overflow-visible"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

          {items.map((item) => {
            const Wrapper = item.href ? "a" : "button";
            return (
              <div key={item.id} className="flex flex-col items-center">
                <Wrapper
                  href={item.href}
                  type={item.href ? undefined : "button"}
                  aria-label={item.label || `Video ${item.id}`}
                  className="
                    group relative inline-flex rounded-full
                    outline-2 outline-primary outline-offset-2
                    focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                  "
                  style={{ width: size, height: size }}
                >
                  {/* IG gradient ring */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{ padding: ringWidth, background: ring }}
                  />
                  {/* Video circle */}
                  <span className="relative inline-block h-full w-full overflow-hidden rounded-full bg-background">
                    <AspectRatio ratio={1}>
                      <video
                        src={item.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        onMouseEnter={(e) => pauseOnHover && e.currentTarget.pause()}
                        onMouseLeave={(e) => pauseOnHover && e.currentTarget.play()}
                      />
                    </AspectRatio>
                  </span>
                </Wrapper>

                {showLabels && (
                  <span className="mt-1 line-clamp-1 w-[88px] sm:w-[96px] text-center text-[11px] sm:text-xs text-foreground/80">
                    {item.label ?? `Look ${item.id}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
