import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { shopify } from "@/lib/shopify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GET_PRODUCT_RECOMMENDATIONS, // make sure this matches the query below
  CART_CREATE,
  CART_LINES_ADD,
} from "@/lib/queries";

const BRAND = "#642c44";
const MAX_ITEMS_DEFAULT = 4;

/* Helpers */
function Stars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <div className="h-5 leading-none text-[#f5a623] text-[15px]">
      {"★".repeat(v)}
      {"☆".repeat(5 - v)}
    </div>
  );
}

function Price({ amount, code }) {
  const num = Number.parseFloat(amount ?? 0);
  return (
    <p className="font-secondary text-[0.95rem] text-[color:var(--brand-642,#642c44)]">
      ₹{Number.isFinite(num) ? num.toFixed(0) : "0"} {code}
    </p>
  );
}

/** Resolve product id from handle (inline, simple) */
const GET_PRODUCT_ID_BY_HANDLE = /* GraphQL */ `
  query getProductIdByHandle($handle: String!) {
    product(handle: $handle) { id }
  }
`;

export default function SuggestionSection({
  productId,                       // optional; if absent, we’ll look at :handle
  title = "You Might Also Like",
  max = MAX_ITEMS_DEFAULT,         // how many to render (we’ll slice client-side)
  showPrice = true,
}) {
  const { handle: routeHandle } = useParams();

  const [pid, setPid] = useState(productId ?? null);
  const [loadingId, setLoadingId] = useState(!productId && !!routeHandle);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState/** @type {null|string} */(null);
  const [data, setData] = useState(null);

  // Resolve id from :handle if needed
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (productId) {
        setPid(productId);
        setLoadingId(false);
        return;
      }
      if (!routeHandle) {
        setLoadingId(false);
        return;
      }
      try {
        setLoadingId(true);
        const d = await shopify(GET_PRODUCT_ID_BY_HANDLE, { handle: routeHandle });
        if (!cancelled) setPid(d?.product?.id ?? null);
      } catch {
        if (!cancelled) setPid(null);
      } finally {
        if (!cancelled) setLoadingId(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId, routeHandle]);

  // Fetch recommendations when we have a product id
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pid) {
        setLoading(false);
        setData(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const d = await shopify(GET_PRODUCT_RECOMMENDATIONS, { productId: pid });
        if (!cancelled) setData(d);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e?.message || "Failed to load suggestions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pid]);

  /* Map to card-friendly objects */
  const items = useMemo(() => {
    const recs = data?.productRecommendations ?? [];
    return recs.map((node) => {
      let ratingValue = 0;
      if (node?.rating?.value) {
        try {
          const parsed = JSON.parse(node.rating.value);
          ratingValue = Number.parseFloat(parsed?.value ?? 0) || 0;
        } catch {}
      }
      const img = node?.images?.edges?.[0]?.node;
      const variant = node?.variants?.edges?.[0]?.node;
      return {
        id: node?.id,
        title: node?.title,
        handle: node?.handle,
        price: node?.priceRange?.minVariantPrice?.amount,
        currency: node?.priceRange?.minVariantPrice?.currencyCode,
        imageUrl: img?.url || img?.src || "https://via.placeholder.com/600x800",
        altText: img?.altText || node?.title,
        ratingValue,
        variantId: variant?.id ?? null,
        available: !!variant?.availableForSale,
      };
    });
  }, [data]);

  const itemsToShow = useMemo(() => items.slice(0, max), [items, max]);

  /* Cart helpers (same flow as your ShortDressSection) */
  const [cartBusy, setCartBusy] = useState({}); // productId -> boolean | "added"
  const getStoredCartId = () => {
    try { return localStorage.getItem("shopifyCartId") || null; } catch { return null; }
  };
  const setStoredCartId = (id) => { try { localStorage.setItem("shopifyCartId", id); } catch {} };

  const handleAddToCart = useCallback(async (product) => {
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
  }, []);

  const showingLoader = loadingId || loading;

  return (
    <section className="bg-white px-[5%] py-12 text-center">
      <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
        {title}
      </h2>

      {/* Loading skeletons */}
      {showingLoader ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: max }).map((_, i) => (
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
      ) : error ? (
        <p className="font-secondary text-[color:var(--brand-642,#642c44)]/80">
          Could not load suggestions: {error}
        </p>
      ) : itemsToShow.length === 0 ? (
        <p className="font-secondary text-[color:var(--brand-642,#642c44)]/80">
          No suggestions available.
        </p>
      ) : (
        <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-2">
          {itemsToShow.map((product) => {
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
                    {/* Image + QUICK VIEW overlay */}
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
                        <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/50 text-white text-center py-2 font-secondary font-semibold">
                            QUICK VIEW
                          </div>
                        </div>
                      </AspectRatio>
                    </div>

                    {/* Details */}
                    <div className="px-1 pt-3 flex flex-col justify-center items-center gap-1.5">
                      <h3
                        className="font-secondary text-[1.1rem] font-semibold text-[color:var(--brand-642,#642c44)] leading-[1.35] truncate"
                        style={{ height: "calc(1em * 1.35)" }}
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      {showPrice && (
                        <Price amount={product.price} code={product.currency} />
                      )}

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
      )}
    </section>
  );
}
