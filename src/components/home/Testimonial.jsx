"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { shopify } from "@/lib/shopify";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GET_PRODUCTS_WITH_REVIEWS } from "@/lib/queries";

const PRODUCT_LIMIT = 24;
const REVIEW_LIMIT = 12;

/* ---------- UI bits ---------- */
function Stars({ value = 0, size = 20 }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const h = Math.ceil(size * 1.05);
  return (
    <div className="leading-none text-[#f5a623]" style={{ fontSize: `${size}px`, height: `${h}px` }}>
      {"★".repeat(v)}
      {"☆".repeat(5 - v)}
    </div>
  );
}

/* ---------- Flip Card ---------- */
function ReviewFlipCard({ t }) {
  const initials =
    (t.author || "User")
      .split(" ")
      .slice(0, 2)
      .map((s) => s?.[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="group h-[400px] [perspective:1200px]">
      <div
        className="relative h-full w-full transition-transform duration-500
                   [transform-style:preserve-3d]
                   group-hover:[transform:rotateY(180deg)]
                   focus-within:[transform:rotateY(180deg)]"
        tabIndex={0}
      >
        {/* FRONT: review (bigger & centered) */}
        <Card className="absolute inset-0 [backface-visibility:hidden] rounded-2xl" aria-label="Review front">
          <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center gap-4 mb-5">
              <Avatar className="h-16 w-16 ring-2 ring-[color:var(--brand-642,#642c44)]/10 mx-auto">
                <AvatarImage src={t.productImage} alt={t.author} className="h-full w-auto object-center" />
                <AvatarFallback className="bg-[color:var(--brand-642,#642c44)]/10 text-[color:var(--brand-642,#642c44)] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="font-secondary font-semibold text-neutral-900 leading-tight truncate text-lg">
                  {t.author}
                </p>
                {t.productTitle ? (
                  <p className="font-secondary text-base text-neutral-500 leading-tight truncate">
                    for {t.productTitle}
                  </p>
                ) : null}
              </div>

              <Stars value={t.rating} size={20} />
            </div>

            <blockquote className="font-secondary text-[1.0625rem] md:text-[1.125rem] leading-8 text-neutral-800 text-center max-w-[50ch] mx-auto">
              <span className="select-none text-[color:var(--brand-642,#642c44)] mr-1">“</span>
              {t.reviewText}
              <span className="select-none text-[color:var(--brand-642,#642c44)] ml-1">”</span>
            </blockquote>
          </CardContent>
        </Card>

        {/* BACK: product image */}
        <Card
          className="absolute inset-0 overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden] !py-0 rounded-2xl"
          aria-label="Product image back"
        >
          <CardContent className="p-0 h-full w-full">
            {t.productImage ? (
              <img
                src={t.productImage}
                alt={t.productTitle || "Product"}
                className="h-auto w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-neutral-500">
                No product image
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Main Component (carousel) ---------- */
export default function Testimonial() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState/** @type {string|null} */(null);
  const [data, setData] = useState(null);

  // Autoplay plugin (no pause on hover)
  const autoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      // playOnInit: true, // optional; defaults to true
    })
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await shopify(GET_PRODUCTS_WITH_REVIEWS, { first: PRODUCT_LIMIT });
        if (!cancelled) setData(d);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e?.message || "Failed to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Flatten approved reviews (Air Reviews payload)
  const items = useMemo(() => {
    const edges = data?.products?.edges ?? [];
    const result = edges.flatMap(({ node: product }) => {
      const mf = (product?.metafields ?? []).find(
        (m) => m && m.namespace === "air_reviews_product" && m.key === "data" && m.value
      );
      if (!mf) return [];
      try {
        const payload = JSON.parse(mf.value);
        const approved = (payload?.reviews ?? []).filter((r) => r?.status === "approved");
        const firstImg = product?.images?.edges?.[0]?.node;
        return approved.map((r) => {
          const authorRaw = r.firstName || r.author || r.name || r.user || "Valued Customer";
          const author = String(authorRaw).trim() || "Valued Customer";
          return {
            id: `${product.id}-${r.id ?? Math.random().toString(36).slice(2)}`,
            author,
            rating: Number(r.rate) || 0,
            reviewText: r.text || r.body || r.content || "",
            productTitle: product?.title || "",
            productImage: firstImg?.url || "",
          };
        });
      } catch {
        return [];
      }
    });
    return result.slice(0, REVIEW_LIMIT);
  }, [data]);

  if (loading) {
    return (
      <section id="reviews-section" className="bg-accent px-[5%] py-12">
        <h2 className="text-center cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-8">
          What Our Customers Say
        </h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-neutral-200/70">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="reviews-section" className="bg-accent px-[5%] py-12 text-center">
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-4">
          What Our Customers Say
        </h2>
        <p className="font-secondary text-[#642c44]/80">Couldn’t load reviews: {error}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section id="reviews-section" className="bg-accent px-[5%] py-12 text-center">
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-4">
          What Our Customers Say
        </h2>
        <p className="font-secondary text-[#642c44]/80">No approved reviews found yet.</p>
      </section>
    );
  }

  // If there are not enough items for 3-up at lg, reduce to 2-up to force movement.
  const threeUp = items.length >= 4;

  return (
    <section id="reviews-section" className="bg-accent px-[5%] py-12">
      <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl">
        What Our Customers Say
      </h2>
      <p className="text-center font-secondary text-neutral-600 mb-8">
        Real words from real customers — style, comfort, and confidence.
      </p>

      <Carousel
        opts={{ align: "start", loop: items.length > 1 }}
        plugins={[autoplay.current]}   // autoplay enabled, no hover pause
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {items.map((t) => (
            <CarouselItem
              key={t.id}
              className={`pl-2 md:pl-4 basis-full sm:basis-1/2 ${threeUp ? "lg:basis-1/3" : "lg:basis-1/2"}`}
            >
              <ReviewFlipCard t={t} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
