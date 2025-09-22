// src/components/WatchAndBuy.jsx
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import Tropical from "@/assets/videos/Video-111.mp4";
import Earthy from "@/assets/videos/Video-114.mp4";
import Sunsoaked from "@/assets/videos/Video-339.mp4";
import HighWaist from "@/assets/videos/Video-766.mp4";
import Leopard from "@/assets/videos/Video-609.mp4";

import image1 from "@/assets/images/image1.png";
import image2 from "@/assets/images/image2.png";
import image3 from "@/assets/images/image3.png";
import image4 from "@/assets/images/image4.png";
import image5 from "@/assets/images/image5.png";

export default function WatchAndBuy() {
  const videos = [
    { id: 1, videoUrl: Tropical,  productName: "Tropical Blush Co-ord Set",                    productLink: "/collections/co-ords/products/tropical-blush-set", thumbnail: image1 },
    { id: 2, videoUrl: Earthy,    productName: "Earthy Green Co-ord Set",                      productLink: "https://shopify-storefront-rlry.vercel.app/products/earthy-green-embroidered-waistcoat-co-ord-set", thumbnail: image2 },
    { id: 3, videoUrl: Sunsoaked, productName: "Sunsoaked Terra Co-ord Set",                   productLink: "/collections/co-ords/products/sunsoaked-terra-set", thumbnail: image3 },
    { id: 4, videoUrl: HighWaist, productName: "High Waist Flared Trousers",                   productLink: "/collections/bottoms/products/high-waist-trousers", thumbnail: image4 },
    { id: 5, videoUrl: Leopard,   productName: "Leopard Print One-Shoulder Maxi Dress",        productLink: "https://delan1.myshopify.com/products/leopard-print-one-shoulder-maxi-dress", thumbnail: image5 },
    { id: 6, videoUrl: Leopard,   productName: "Leopard Print One-Shoulder Maxi Dress",        productLink: "https://delan1.myshopify.com/products/leopard-print-one-shoulder-maxi-dress", thumbnail: image5 },
    { id: 7, videoUrl: Leopard,   productName: "Leopard Print One-Shoulder Maxi Dress",        productLink: "https://delan1.myshopify.com/products/leopard-print-one-shoulder-maxi-dress", thumbnail: image5 },
    { id: 8, videoUrl: Leopard,   productName: "Leopard Print One-Shoulder Maxi Dress",        productLink: "https://delan1.myshopify.com/products/leopard-print-one-shoulder-maxi-dress", thumbnail: image5 },
  ];

  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const getStep = () => {
    const track = trackRef.current;
    if (!track) return 300;
    const first = track.querySelector("[data-card]");
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0");
    return (first?.getBoundingClientRect().width || 260) + gap;
  };

  const scrollByCards = (n) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: n * getStep(), behavior: "smooth" });
  };

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  // drag-to-scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    const down = (e) => {
      isDown = true;
      el.classList.add("cursor-grabbing");
      startX = (e.touches ? e.touches[0].pageX : e.pageX);
      startLeft = el.scrollLeft;
    };
    const move = (e) => {
      if (!isDown) return;
      const x = (e.touches ? e.touches[0].pageX : e.pageX);
      el.scrollLeft = startLeft - (x - startX);
    };
    const up = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };

    el.addEventListener("mousedown", down);
    el.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", up);

    return () => {
      el.removeEventListener("mousedown", down);
      el.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", up);
    };
  }, []);

  const isExternal = (href) => /^https?:\/\//i.test(href);

  return (
    <section className="bg-white px-5 py-10 sm:px-[5%]">
      <h2 className="text-center cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-6">
        Discover Your Look
      </h2>

      <div className="relative">
        {/* Prev */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Previous"
          disabled={!canPrev}
          onClick={() => scrollByCards(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-sm
                     bg-black/40 hover:bg-black/60 text-white border-0
                     w-10 h-10 disabled:opacity-35"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Track */}
        <div
          ref={trackRef}
          role="region"
          aria-label="Reels carousel"
          className="
            flex gap-5 overflow-x-hidden px-1 py-2 scroll-smooth
            snap-x snap-mandatory cursor-grab
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {videos.map((item) => {
            const ProductLink = isExternal(item.productLink) ? "a" : Link;
            const linkProps = isExternal(item.productLink)
              ? { href: item.productLink, target: "_blank", rel: "noreferrer" }
              : { to: item.productLink };

            return (
              <Card
                key={item.id}
                data-card
                className="
                  flex-none
                  w-[240px] sm:w-[260px] lg:w-[280px]
                  border border-black/10 rounded-2xl shadow-sm snap-start overflow-hidden py-0!
                "
              >
                <CardContent className="p-0">
                  {/* ✅ Lock the video to a fixed 9:16 area so every card looks identical */}
                  <AspectRatio ratio={11 / 16} className="w-full">
                    <video
                      src={item.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover block"
                    />
                  </AspectRatio>

                  {/* ✅ Fixed-height info area so total card height never varies */}
                  <div
                    className="
                      grid items-center gap-x-2 gap-y-1 p-2.5
                      [grid-template-columns:60px_1fr] [grid-template-rows:auto_auto]
                      [grid-template-areas:'thumb_name''thumb_buy']
                      h-[120px] sm:h-[130px]
                    "
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.productName}
                      className="[grid-area:thumb] w-[60px] h-[80px] object-cover rounded-md select-none"
                      draggable="false"
                    />

                    <p
                      className="
                        [grid-area:name] m-0 font-secondary font-semibold text-[15px] sm:text-[16px] leading-5
                        text-neutral-900 overflow-hidden
                      "
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                      title={item.productName}
                    >
                      {item.productName}
                    </p>

                    <Button
                      asChild
                      className="
                        [grid-area:buy] justify-center w-full rounded-xl bg-[#642c44]
                        hover:bg-[#53253a] text-white text-sm font-semibold h-9
                      "
                    >
                      <ProductLink {...linkProps}>Buy</ProductLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Next */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Next"
          disabled={!canNext}
          onClick={() => scrollByCards(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-sm
                     bg-black/40 hover:bg-black/60 text-white border-0
                     w-10 h-10 disabled:opacity-35"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
