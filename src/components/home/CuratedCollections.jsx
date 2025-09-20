import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { shopify } from "@/lib/shopify";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GET_CURATED_THREE } from "@/lib/queries";
/**
 * Pass custom labels/handles with the `items` prop (length 3).
 * Example:
 * <CuratedCollections items={[
 *   { label: "SUMMER & RESORT", handle: "summer-resort" },
 *   { label: "WINTER & FESTIVE", handle: "winter-festive" },
 *   { label: "THE FINISHING STROKE: TOPS", handle: "tops" }
 * ]}/>
 */
const DEFAULT_ITEMS = [
  { label: "SUMMER & RESORT", handle: "summer-resort" },
  { label: "WINTER & FESTIVE", handle: "winter-festive" },
  { label: "THE FINISHING STROKE: TOPS", handle: "tops" },
];

export default function CuratedCollections({ items = DEFAULT_ITEMS }) {
  const [i1, i2, i3] = items;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const d = await shopify(GET_CURATED_THREE, {
          h1: i1.handle,
          h2: i2.handle,
          h3: i3.handle,
        });
        if (!cancelled) setData(d);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr(e?.message || "Failed to load curated collections");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [i1.handle, i2.handle, i3.handle]);

  const cards = useMemo(() => ([
    { cfg: i1, col: data?.c1 },
    { cfg: i2, col: data?.c2 },
    { cfg: i3, col: data?.c3 },
  ]), [data, i1, i2, i3]);

  return (
    <section className="bg-[#f6e9e6] px-[5%] py-12">
      <header className="mx-auto mb-5 max-w-[1200px]">
        <h2 className="font-primary italic uppercase tracking-[0.04em] text-[color:var(--brand-642,#642c44)] font-semibold text-[clamp(1.6rem,4vw,3rem)]">
          DESIGNED FOR YOUR TRUE STYLE
        </h2>
        <p className="font-secondary mt-1 text-[0.95rem] text-black/60">
          To make things easier, we’ve gathered your favorites here.
        </p>
      </header>

      {/* Loading */}
      {loading && (
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="mb-2 h-4 w-1/2 rounded bg-neutral-200" />
                <AspectRatio ratio={4 / 5} className="rounded-md bg-neutral-100">
                  <Skeleton className="h-full w-full rounded-md" />
                </AspectRatio>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {err && !loading && (
        <div className="mx-auto max-w-[1200px] rounded-md border border-red-200 bg-red-50 px-4 py-3 font-secondary text-red-800">
          Couldn’t load curated collections: {err}
        </div>
      )}

      {/* Content */}
      {!loading && !err && (
        <div className="mx-auto max-w-[1200px]">
          <Carousel
            opts={{ align: "start", loop: false }}
            className="relative"
          >
            <CarouselContent>
              {cards.map(({ cfg, col }) => {
                const img = col?.image?.url || "/images/placeholder-4x5.png";
                const alt = col?.image?.altText || col?.title || cfg.label;
                const link = `/collections/${col?.handle || cfg.handle}`;

                return (
                  <CarouselItem
                    key={cfg.handle}
                    className="basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <article className="flex flex-col gap-2">
                      <div className="font-secondary text-[0.72rem] uppercase tracking-[0.12em] text-black/65">
                        {cfg.label}
                      </div>

                      <Link to={link} aria-label={`Open ${cfg.label}`}>
                        <div className="rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                          <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-md">
                            <img
                              src={img}
                              alt={alt}
                              className="h-full w-full select-none object-cover transition-transform duration-300 hover:scale-[1.04]"
                              loading="lazy"
                              decoding="async"
                              draggable="false"
                            />
                          </AspectRatio>
                        </div>
                      </Link>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Brand-styled arrows */}
            <CarouselPrevious className="left-[-14px] h-10 w-10 rounded-full border-black/35 text-black/60 hover:bg-[color:var(--brand-642,#642c44)] hover:text-white hover:border-[color:var(--brand-642,#642c44)]" />
            <CarouselNext className="right-[-14px] h-10 w-10 rounded-full border-black/35 text-black/60 hover:bg-[color:var(--brand-642,#642c44)] hover:text-white hover:border-[color:var(--brand-642,#642c44)]" />
          </Carousel>
        </div>
      )}
    </section>
  );
}
