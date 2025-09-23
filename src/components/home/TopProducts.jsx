import React, { useCallback, useEffect, useMemo, useState } from "react";
import { shopify } from "@/lib/shopify";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GET_TOP_PRODUCTS,
  GET_COLLECTIONS,
  CART_CREATE,
  CART_LINES_ADD,
} from "@/lib/queries";

const BRAND = "#642c44";

/* Small helpers */
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
    <p className="font-secondary text-[0.95rem] text-primary">
      ₹{Number.isFinite(num) ? num.toFixed(0) : "0"} {code}
    </p>
  );
}

/**
 * TopProducts can render:
 * - mode="products": products for a collection handle (default)
 * - mode="collections": a grid of collections
 */
export default function TopProducts({
  mode = "products",
  handle = "top-products",
  title = "Shop By Category",
  collectionsFirst = 12, // how many collections to fetch when mode="collections"
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState/** @type {null | string} */(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        let d;
        if (mode === "collections") {
          // fetch a list of collections
          d = await shopify(GET_COLLECTIONS, { first: collectionsFirst });
        } else {
          // fetch products for a collection handle
          d = await shopify(GET_TOP_PRODUCTS, { handle });
        }

        if (!cancelled) setData(d);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, handle, collectionsFirst]);

  /* ================== RENDER COLLECTIONS MODE ================== */
  if (mode === "collections") {
    const collections = (data?.collections?.edges ?? []).map(({ node }) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      imgUrl: node.image?.url || node.image?.src || "",
      altText: node.image?.altText || node.title,
    }));

    if (loading) {
      return (
        <section className="bg-white px-[5%] py-10 text-center">
          <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-4xl mb-6">
            {title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-none">
                <CardContent className="p-0">
                  <AspectRatio ratio={3 / 4} className="rounded-xl bg-neutral-100">
                    <Skeleton className="h-full w-full rounded-xl" />
                  </AspectRatio>
                  <div className="px-1 pt-3 space-y-2 text-left">
                    <Skeleton className="h-5 w-2/3" />
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
        <section className="bg-white px-[5%] py-12 text-center">
          <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
            {title}
          </h2>
          <p className="font-secondary text-primary/80">Error: {error}</p>
        </section>
      );
    }

    if (collections.length === 0) {
      return (
        <section className="bg-white px-[5%] py-12 text-center">
          <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
            {title}
          </h2>
          <p className="font-secondary text-primary/80">No collections found.</p>
        </section>
      );
    }

    return (
      <section className="bg-white px-[5%] py-12 text-center">
        <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-6">
          {title}
        </h2>
        <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          {collections.map((c) => (
            <Card key={c.id} className="border-0 shadow-none text-left group">
              <Link
                to={`/collections/${c.handle}`}
                aria-label={c.title}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ ["--tw-ring-color"]: BRAND }}
              >
                <CardContent className="p-0">
                  <AspectRatio ratio={3 / 4} className="rounded-2xl overflow-hidden bg-rose-50">
                    {c.imgUrl ? (
                      <img
                        src={c.imgUrl}
                        alt={c.altText}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] select-none"
                        draggable="false"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="grid place-items-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </AspectRatio>
                  <div className="px-1 pt-3">
                    <h3
                      className="font-secondary text-[1.1rem] font-semibold text-[color:var(--brand-642,#642c44)] leading-[1.35] truncate"
                      title={c.title}
                      style={{ height: "calc(1em * 1.35)" }}
                    >
                      {c.title}
                    </h3>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  /* ================== RENDER PRODUCTS MODE ================== */

  const products = useMemo(() => {
    const edges = data?.collection?.products?.edges ?? [];
    return edges.map(({ node }) => {
      let ratingValue = 0;
      if (node.rating?.value) {
        try {
          const parsed = JSON.parse(node.rating.value);
          ratingValue = Number.parseFloat(parsed?.value ?? 0) || 0;
        } catch {}
      }
      const img = node.images?.edges?.[0]?.node;
      const variant = node.variants?.edges?.[0]?.node;

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        price: node.priceRange?.minVariantPrice?.amount,
        currency: node.priceRange?.minVariantPrice?.currencyCode,
        imageUrl: img?.url ?? "https://via.placeholder.com/600x800",
        altText: img?.altText || node.title,
        ratingValue,
        variantId: variant?.id ?? null,
        available: !!variant?.availableForSale,
      };
    });
  }, [data]);

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

  // Loading / Error
  if (loading) {
    return (
      <section className="bg-white px-[5%] py-10 text-center">
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl lg:text-4xl mb-6">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      <section className="bg-white px-[5%] py-12 text-center">
        <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
          {title}
        </h2>
        <p className="font-secondary text-primary/80">Error loading products: {error}</p>
      </section>
    );
  }

  if (!data?.collection || products.length === 0) {
    return (
      <section className="bg-white px-[5%] py-12 text-center">
        <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-4">
          {title}
        </h2>
        <p className="font-secondary text-primary/80">
          The “{handle}” collection could not be found or is empty.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white px-[5%] py-12 text-center">
      <h2 className="text-center cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl mb-6">
        {title}
      </h2>

      <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {products.map((product) => {
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

                  <div className="px-1 pt-3 flex flex-col justify-center items-center gap-1.5">
                    <h3
                      className="font-secondary text-[1.1rem] font-semibold text-[color:var(--brand-642,#642c44)] leading-[1.35] truncate"
                      style={{ height: "calc(1em * 1.35)" }}
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    <Price amount={product.price} code={product.currency} />

                    {product.ratingValue > 0 ? (
                      <Stars value={product.ratingValue} />
                    ) : (
                      <div className="h-5" aria-hidden="true" />
                    )}

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
        <Link to={mode === "collections" ? "/collections" : `/collections/${handle}`}>
          View All
        </Link>
      </Button>
    </section>
  );
}
