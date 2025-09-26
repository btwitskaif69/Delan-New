// src/components/CoOrdsSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { shopify } from "@/lib/shopify";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_COLLECTION_PRODUCTS } from "@/lib/queries";

/** Meta shown under the carousel (synced to current slide) */
const CATEGORY_META = [
  {
    slug: "all-dresses",
    title: "All Dresses",
    subtitle: "Find Your Vibe in Effortless Dresses",
    tagline: "Where timeless design meets everyday elegance.",
    cta: "SHOP NOW",
    to: "/collections/dresses",
  },
  {
    slug: "maxi-midi",
    title: "Maxi & Midi Statements",
    subtitle: "Own Your Moment in Maxi & Midi Styles",
    tagline: "Flowing silhouettes that speak confidence.",
    cta: "SHOP NOW",
    to: "/collections/maxi-midi",
  },
  {
    slug: "evening-edit",
    title: "The Evening Edit",
    subtitle: "Turn Every Night Into a Statement",
    tagline: "Luxury evening wear designed to dazzle.",
    cta: "SHOP NOW",
    to: "/collections/evening-edit",
  },
  {
    slug: "all-trousers",
    title: "All Trousers",
    subtitle: "Power Dressing, Perfected",
    tagline: "Tailored trousers for style and substance.",
    cta: "SHOP NOW",
    to: "/collections/trousers",
  },
  {
    slug: "global-silhouettes",
    title: "Global Silhouettes",
    subtitle: "Inspired by the World, Made for You",
    tagline: "Western wear with a modern global twist.",
    cta: "SHOP NOW",
    to: "/collections/global-silhouettes",
  },
  {
    slug: "classic-bootcut",
    title: "The Classic Bootcut",
    subtitle: "Where Elegance Meets Comfort",
    tagline: "Bootcut trousers designed to flatter every step.",
    cta: "SHOP NOW",
    to: "/collections/bootcut",
  },
  {
    slug: "all-tops",
    title: "All Tops",
    subtitle: "Elevate Your Everyday",
    tagline: "Versatile tops for modern women on the move.",
    cta: "SHOP NOW",
    to: "/collections/tops",
  },
  {
    slug: "lyrical-blouse",
    title: "The Lyrical Blouse",
    subtitle: "Feminine · Fluid · Fearless",
    tagline: "Blouses that add poetry to your wardrobe.",
    cta: "SHOP NOW",
    to: "/collections/lyrical-blouse",
  },
  {
    slug: "thesis-on-shirts",
    title: "A Thesis on Shirts",
    subtitle: "Smart. Sharp. Sophisticated.",
    tagline: "Reimagining shirts for the empowered woman.",
    cta: "SHOP NOW",
    to: "/collections/shirts",
  },
];

export default function CoOrdsSection() {
  const collectionHandle = "co-ords";

  // data
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // carousel
  const [api, setApi] = useState(null);
  const [selected, setSelected] = useState(0);

  // fetch products
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const d = await shopify(GET_COLLECTION_PRODUCTS, {
          handle: collectionHandle,
          first: 12,
        });
        if (!cancelled) setData(d);
      } catch (e) {
        console.error("Co-Ords GraphQL error:", e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [collectionHandle]);

  const products = useMemo(() => {
    const edges = data?.collection?.products?.edges ?? [];
    return edges
      .map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        image: node.images?.edges?.[0]?.node?.url || null,
        altText: node.images?.edges?.[0]?.node?.altText || node.title,
      }))
      .filter((p) => !!p.image);
  }, [data]);

  const hasSlides = products.length > 0;

  // sync CTA text with current slide
  useEffect(() => {
    if (!api) return;
    const onSel = () => setSelected(api.selectedScrollSnap());
    onSel();
    api.on("select", onSel);
    return () => api.off("select", onSel);
  }, [api]);

  const activeMeta =
    hasSlides && CATEGORY_META.length
      ? CATEGORY_META[selected % CATEGORY_META.length]
      : CATEGORY_META[0];

  return (
    <section className="relative overflow-hidden bg-accent py-12">
      {/* Top layout */}
      <div className="mx-auto grid w-[min(90%,1400px)] items-center justify-items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left text (desktop) */}
        <div className="hidden select-none text-primary md:flex md:flex-col md:justify-center">
          <span className="cormorant-garamond-700 text-[clamp(28px,4.5vw,56px)] font-bold leading-tight">FIND</span>
          <span className="ml-16 cormorant-garamond-700 text-[clamp(28px,4.5vw,56px)] font-bold leading-tight">YOUR</span>
          <span className="ml-36 cormorant-garamond-700 text-[clamp(28px,4.5vw,56px)] font-bold leading-tight">VIBE</span>
        </div>

        {/* Center carousel (one image per card, no crop) */}
        <div className="flex items-center justify-center">
          <Card className=" py-0!">
            <CardContent className="px-0!">
              {loading ? (
                <div className="grid h-[380px] w-[280px] place-items-center rounded-xl md:h-[350px] md:w-[260px] sm:h-[320px] sm:w-[240px]">
                  <Skeleton className="h-[85%] w-[85%] rounded-lg" />
                </div>
              ) : !hasSlides ? (
                <div className="grid h-[380px] w-[280px] place-items-center rounded-xl md:h-[350px] md:w-[260px] sm:h-[320px] sm:w-[240px]">
                  <p className="font-secondary text-sm text-primary/70">No products found.</p>
                </div>
              ) : (
                <Carousel
                  opts={{ align: "center", loop: true }}
                  setApi={setApi}
                  className="relative w-[300px] sm:w-[340px] md:w-[320px]"
                >
                  <CarouselContent>
                    {products.map((p) => (
                      <CarouselItem key={p.id} className="basis-full ">
                        {/* Card-size wrapper */}
                        <div className="rounded-xl bg-white">
                          {/* keep a portrait feel; shows full image */}
                          <AspectRatio ratio={3 / 4} className="rounded-xl bg-neutral-100">
                            <img
                              src={p.image}
                              alt={p.altText}
                              draggable="false"
                              className="h-full w-full select-none rounded-xl object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </AspectRatio>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Prev / Next in brand color */}
                  <CarouselPrevious className="left-[-56px] h-11 w-11 rounded-full bg-white/90 hover:bg-white text-primary shadow" />
                  <CarouselNext className="right-[-56px] h-11 w-11 rounded-full bg-white/90 hover:bg-white text-primary shadow" />
                </Carousel>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right text (desktop) */}
        <div className="hidden select-none text-right text-primary md:flex md:flex-col md:justify-center">
          <span className="-mr-12 cormorant-garamond-700 text-[clamp(28px,4.5vw,56px)] font-bold leading-tight">OWN</span>
          <span className="mr-4 cormorant-garamond-700 text-[clamp(28px,4.5vw,56px)] font-bold leading-tight">YOUR</span>
          <span className="mr-10 cormorant-garamond-700 text-[clamp(28px,4.5vw,56px)] font-bold leading-tight">MOMENT</span>
        </div>

        {/* Mobile/tablet headline */}
        <div className="col-span-full flex w-full items-center justify-center gap-2 md:hidden">
          <p className="cormorant-garamond-700 text-[clamp(28px,7vw,44px)] font-bold leading-none text-primary">
            FIND YOUR VIBE
          </p>
        </div>
      </div>

      {/* Description / CTA synced to slide */}
      <div className="mx-auto mt-6 flex max-w-[900px] flex-col items-center px-5 text-center">
        <p className="montserrat-500 text-md tracking-wide text-primary">{activeMeta.title}</p>
        <h3 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl uppercase">
          {activeMeta.subtitle}
        </h3>
        <p className="montserrat-500 mt-1 max-w-[640px] text-[clamp(0.95rem,1.6vw,1.1rem)] leading-relaxed text-primary">
          {activeMeta.tagline}
        </p>

        <Button asChild size="lg" className="mt-4">
          <Link to={activeMeta.to} aria-label={activeMeta.cta}>
            {activeMeta.cta}
          </Link>
        </Button>
      </div>
    </section>
  );
}
