// src/components/OfferSection.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { shopify } from "@/lib/shopify";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  GET_OFFER_PRODUCTS,
  CART_CREATE,
  CART_LINES_ADD,
} from "@/lib/queries";

const BRAND = "#642c44";
const MAX_ITEMS = 12; // fetch more; carousel will show responsively

/* Small helpers */
function formatINR(amount) {
  const num = Number.parseFloat(amount ?? 0);
  return Number.isFinite(num) ? num.toFixed(0) : "0";
}
function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <div className="h-5 leading-none text-[#f5a623] text-[15px]">
      {"★".repeat(v)}
      {"☆".repeat(5 - v)}
    </div>
  );
}

export default function OfferSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState/** @type {null | string} */(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await shopify(GET_OFFER_PRODUCTS, { first: 48 });
        if (!cancelled) setData(d);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e?.message || "Failed to load offers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const discountedProducts = useMemo(() => {
    const edges = data?.products?.edges ?? [];
    return edges
      .map(({ node }) => {
        const img = node.images?.edges?.[0]?.node;
        const variants = node.variants?.edges?.map(e => e.node) ?? [];

        let best = null;
        for (const v of variants) {
          const price = Number.parseFloat(v?.price?.amount ?? "0");
          const compare = Number.parseFloat(v?.compareAtPrice?.amount ?? "0");
          if (compare > price && price > 0) {
            const pct = Math.round(((compare - price) / compare) * 100);
            if (!best || pct > best.discountPct) {
              best = {
                variantId: v.id,
                available: !!v.availableForSale,
                price,
                compare,
                currency: v?.price?.currencyCode,
                discountPct: pct,
              };
            }
          }
        }
        if (!best) return null;

        let ratingValue = 0;
        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          imageUrl: img?.url ?? "https://via.placeholder.com/600x800",
          altText: img?.altText || node.title,
          ratingValue,
          ...best,
        };
      })
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  }, [data]);

  // cart state
  const [cartBusy, setCartBusy] = useState({}); // productId -> boolean | "added"
  const getStoredCartId = () => {
    try { return localStorage.getItem("shopifyCartId") || null; } catch { return null; }
  };
  const setStoredCartId = (id) => {
    try { localStorage.setItem("shopifyCartId", id); } catch {}
  };

  const handleAddToCart = useCallback(
    async (product) => {
      setCartBusy((b) => ({ ...b, [product.id]: true }));
      try {
        if (!product.variantId) throw new Error("No purchasable variant found.");

        const lines = [{ merchandiseId: product.variantId, quantity: 1 }];
        let cartId = getStoredCartId();

        if (!cartId) {
          const res = await shopify(CART_CREATE, { lines });
          const errs = res?.cartCreate?.userErrors;
          if (errs?.length) throw new Error(errs.map((e) => e.message).join("; "));
          cartId = res?.cartCreate?.cart?.id;
          if (!cartId) throw new Error("Failed to create cart.");
          setStoredCartId(cartId);
        } else {
          const res = await shopify(CART_LINES_ADD, { cartId, lines });
          const errs = res?.cartLinesAdd?.userErrors;
          if (errs?.length) throw new Error(errs.map((e) => e.message).join("; "));
        }

        setCartBusy((b) => ({ ...b, [product.id]: "added" }));
        setTimeout(() => setCartBusy((b) => ({ ...b, [product.id]: false })), 1000);
      } catch (e) {
        console.error(e);
        setCartBusy((b) => ({ ...b, [product.id]: false }));
        alert(`Could not add to cart: ${e.message || e}`);
      }
    },
    []
  );

  /* Loading / Error states */
  if (loading) {
    return (
      <section id="offers-section" className="bg-white px-[5%] py-10 text-center">
        <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-8">
          Offers & Sale
        </h2>
        <Carousel className="relative">
          <CarouselContent>
            {Array.from({ length: 4 }).map((_, i) => (
              <CarouselItem key={i} className="basis-full sm:basis-1/2 xl:basis-1/4">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <AspectRatio ratio={3 / 4} className="rounded-2xl bg-neutral-100">
                      <Skeleton className="h-full w-full rounded-2xl" />
                    </AspectRatio>
                    <div className="px-1 pt-3 space-y-2 text-left">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-36" />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-[-14px] h-10 w-10 rounded-full border-black/35 text-black/60 hover:bg-[color:var(--brand-642,#642c44)] hover:text-white hover:border-[color:var(--brand-642,#642c44)]" />
          <CarouselNext className="right-[-14px] h-10 w-10 rounded-full border-black/35 text-black/60 hover:bg-[color:var(--brand-642,#642c44)] hover:text-white hover:border-[color:var(--brand-642,#642c44)]" />
        </Carousel>
      </section>
    );
  }

  if (error) {
    return (
      <section id="offers-section" className="bg-white px-[5%] py-12 text-center">
        <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
          Offers & Sale
        </h2>
        <p className="font-secondary text-[#642c44]/80">
          Error loading offers: {error}
        </p>
      </section>
    );
  }

  if (!discountedProducts.length) {
    return (
      <section id="offers-section" className="bg-white px-[5%] py-12 text-center">
        <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
          Offers & Sale
        </h2>
        <p className="font-secondary text-[#642c44]/80">
          No discounted items found right now.
        </p>
      </section>
    );
  }

  return (
    <section id="offers-section" className="bg-white px-[5%] py-12 text-center">
      <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-8">
        Offers & Sale
      </h2>

      <Carousel opts={{ align: "start", loop: false }} className="relative">
        <CarouselContent>
          {discountedProducts.map((product) => {
            const busyState = cartBusy[product.id];
            const isBusy = busyState === true;
            const justAdded = busyState === "added";

            return (
              <CarouselItem
                key={product.id}
                className="basis-full sm:basis-1/2 xl:basis-1/4"
              >
                <Card className="border-0 shadow-none text-left group h-full">
                  <Link
                    to={`/products/${product.handle}`}
                    aria-label={product.title}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-full"
                    style={{ ["--tw-ring-color"]: BRAND }}
                  >
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Image + Sale badge */}
                      <div className="relative">
                        <AspectRatio ratio={3 / 4} className="rounded-2xl overflow-hidden bg-rose-50">
                          <img
                            src={product.imageUrl}
                            alt={product.altText}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] select-none"
                            draggable="false"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute left-3 top-3 rounded-full bg-[#642c44] text-white px-3 py-1 text-xs font-bold shadow-md">
                            -{product.discountPct}% OFF
                          </div>
                          <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/50 text-white text-center py-2 font-secondary font-semibold">
                              QUICK VIEW
                            </div>
                          </div>
                        </AspectRatio>
                      </div>

                      {/* Details */}
                      <div className="px-1 pt-3 flex flex-col items-center gap-1.5">
                        <h3
                          className="font-secondary text-[1.1rem] font-semibold text-[color:var(--brand-642,#642c44)] leading-[1.35] truncate"
                          style={{ height: "calc(1em * 1.35)" }}
                          title={product.title}
                        >
                          {product.title}
                        </h3>

                        <div className="flex items-baseline gap-2">
                          <span className="font-secondary text-[0.95rem] text-[#642c44] font-semibold">
                            ₹{formatINR(product.price)} {product.currency}
                          </span>
                          <span className="font-secondary text-sm text-neutral-500 line-through">
                            ₹{formatINR(product.compare)} {product.currency}
                          </span>
                        </div>

                        {product.ratingValue > 0 ? (
                          <Stars value={product.ratingValue} />
                        ) : (
                          <div className="h-5" aria-hidden="true" />
                        )}

                        {/* Add to Cart */}
                        <div className="w-full mt-1.5 flex justify-center items-center pb-3">
                          <Button
                            className="font-secondary font-semibold border-2"
                            style={{ backgroundColor: BRAND, borderColor: BRAND }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!product.available || isBusy) return;
                              handleAddToCart(product);
                            }}
                            disabled={!product.available || isBusy}
                            aria-disabled={!product.available || isBusy}
                            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 8px 20px rgba(100,44,68,0.30)`)}
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                          >
                            {!product.available
                              ? "Out of stock"
                              : isBusy
                              ? "Adding..."
                              : justAdded
                              ? "Added!"
                              : "Add to Cart"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Show arrows only if there are multiple slides */}
        {discountedProducts.length > 1 && (
          <>
            <CarouselPrevious className="left-[-14px] h-10 w-10 rounded-full border-black/35 text-black/60 hover:bg-[color:var(--brand-642,#642c44)] hover:text-white hover:border-[color:var(--brand-642,#642c44)]" />
            <CarouselNext className="right-[-14px] h-10 w-10 rounded-full border-black/35 text-black/60 hover:bg-[color:var(--brand-642,#642c44)] hover:text-white hover:border-[color:var(--brand-642,#642c44)]" />
          </>
        )}
      </Carousel>

      <Button
        asChild
        variant="outline"
        className="mt-8 uppercase font-secondary font-semibold px-6 py-5 border-2"
        style={{ borderColor: BRAND, color: BRAND }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = BRAND;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = BRAND;
        }}
      >
        <Link to="/collections/sale">View All Offers</Link>
      </Button>
    </section>
  );
}
