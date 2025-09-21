import React, { useCallback, useEffect, useMemo, useState } from "react";
import { shopify } from "@/lib/shopify";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GET_OFFER_PRODUCTS,   // <-- add this in queries.js (below)
  CART_CREATE,
  CART_LINES_ADD,
} from "@/lib/queries";

const BRAND = "#642c44";
const MAX_ITEMS = 4;

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
  // data via your shopify() helper
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState/** @type {null | string} */(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Pull a pool of products; we'll filter for discounts client-side
        const d = await shopify(GET_OFFER_PRODUCTS, { first: 24 });
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

        // Find the best (max) discount among variants
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

        if (!best) return null; // not on sale

        // optional: rating via metafield (if you store it). Safe default 0.
        let ratingValue = 0;
        // If you do have a metafield, add to query & parse like other sections.

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
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-8">
          Offers & Sale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: MAX_ITEMS }).map((_, i) => (
            <Card key={i} className="border-0 shadow-none">
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
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="offers-section" className="bg-white px-[5%] py-12 text-center">
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-4">
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
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-4">
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
      <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-5xl mb-8">
        Offers & Sale
      </h2>

      {/* Grid: 4 → 2 → 1 */}
      <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {discountedProducts.map((product) => {
          const busyState = cartBusy[product.id];
          const isBusy = busyState === true;
          const justAdded = busyState === "added";

          return (
            <Card key={product.id} className="border-0 shadow-none text-left group">
              <Link
                to={`/products/${product.handle}`}
                aria-label={product.title}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ ["--tw-ring-color"]: BRAND }}
              >
                <CardContent className="p-0">
                  {/* Image (3:4) + Sale badge + Quick View on hover */}
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

                      {/* SALE badge */}
                      <div className="absolute left-3 top-3 rounded-full bg-[#642c44] text-white px-3 py-1 text-xs font-bold shadow-md">
                        -{product.discountPct}% OFF
                      </div>

                      {/* Quick view overlay */}
                      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 text-white text-center py-2 font-secondary font-semibold">
                          QUICK VIEW
                        </div>
                      </div>
                    </AspectRatio>
                  </div>

                  {/* Details */}
                  <div className="px-1 pt-3 flex flex-col justify-center items-center gap-1.5">
                    {/* Title */}
                    <h3
                      className="font-secondary text-[1.1rem] font-semibold text-[color:var(--brand-642,#642c44)] leading-[1.35] truncate"
                      style={{ height: "calc(1em * 1.35)" }}
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Price row: sale + compareAt */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-secondary text-[0.95rem] text-[#642c44] font-semibold">
                        ₹{formatINR(product.price)} {product.currency}
                      </span>
                      <span className="font-secondary text-sm text-neutral-500 line-through">
                        ₹{formatINR(product.compare)} {product.currency}
                      </span>
                    </div>

                    {/* Rating placeholder (if you start storing it later) */}
                    {product.ratingValue > 0 ? (
                      <Stars value={product.ratingValue} />
                    ) : (
                      <div className="h-5" aria-hidden="true" />
                    )}

                    {/* Add to Cart */}
                    <div className="w-full mt-1.5 flex justify-center items-center">
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
          );
        })}
      </div>

      {/* Optional CTA to your sale collection */}
      <Button
        asChild
        variant="outline"
        className="uppercase font-secondary font-semibold px-6 py-5 border-2"
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
