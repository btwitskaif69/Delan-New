// src/pages/CollectionPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";

// ✅ use your queries + shopify fetcher
import {
  GET_TOP_PRODUCTS,     // collection(handle) { title, products { ... rating, variants } }
  CART_CREATE,          // requires { lines: [] }
  CART_LINES_ADD,       // add line with { merchandiseId, quantity }
} from "@/lib/queries";
import { shopify } from "@/lib/shopify";

const BRAND = "#642c44";
const CART_ID_KEY = "shopifyCartId";

/* ----------------------------- small helpers ----------------------------- */
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

function parseProducts(collectionData) {
  const edges = collectionData?.products?.edges ?? [];
  return edges.map(({ node }) => {
    // rating metafield is often JSON like {"value":"4.3"}
    let ratingValue = 0;
    if (node?.rating?.value) {
      try {
        const parsed = JSON.parse(node.rating.value);
        ratingValue = Number.parseFloat(parsed?.value ?? 0) || 0;
      } catch {
        const n = Number(node.rating.value);
        if (Number.isFinite(n)) ratingValue = n;
      }
    }

    const img = node?.images?.edges?.[0]?.node;
    const firstVariant = node?.variants?.edges?.[0]?.node;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      price: node.priceRange?.minVariantPrice?.amount,
      currency: node.priceRange?.minVariantPrice?.currencyCode,
      imageUrl: img?.url || "https://via.placeholder.com/600x800",
      altText: img?.altText || node.title,
      ratingValue: Math.max(0, Math.min(5, Math.round(ratingValue))),
      variantId: firstVariant?.id || null,
      available: !!firstVariant?.availableForSale,
    };
  });
}

// localStorage helpers
const getStoredCartId = () => {
  try { return localStorage.getItem(CART_ID_KEY) || null; } catch { return null; }
};
const setStoredCartId = (id) => {
  try { localStorage.setItem(CART_ID_KEY, id); } catch {}
};

/* ------------------------------ main component --------------------------- */
export default function CollectionPage() {
  const { handle } = useParams();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [rawProducts, setRawProducts] = useState([]);
  const [error, setError] = useState("");

  // UI sort
  const [sort, setSort] = useState("featured"); // featured | price-asc | price-desc | title-asc | title-desc

  // per-item adding/busy state
  const [adding, setAdding] = useState({}); // { [productId]: true | false }

  // fetch collection (reusing GET_TOP_PRODUCTS so it includes variants+rating)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await shopify(GET_TOP_PRODUCTS, { handle });
        if (cancelled) return;

        const col = data?.collection;
        if (!col) {
          setTitle("");
          setRawProducts([]);
        } else {
          setTitle(col.title || "");
          setRawProducts(parseProducts(col));
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load collection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [handle]);

  // sorting
  const products = useMemo(() => {
    const arr = [...rawProducts];
    switch (sort) {
      case "price-asc":
        arr.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
        break;
      case "price-desc":
        arr.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
        break;
      case "title-asc":
        arr.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        arr.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // featured: keep API order
        break;
    }
    return arr;
  }, [rawProducts, sort]);

  // ensure/create cart id
  const ensureCartId = useCallback(async () => {
    let id = getStoredCartId();
    if (id) return id;
    const res = await shopify(CART_CREATE, { lines: [] });
    const errs = res?.cartCreate?.userErrors;
    if (errs?.length) throw new Error(errs.map(e => e.message).join("; "));
    id = res?.cartCreate?.cart?.id;
    if (!id) throw new Error("Cart creation failed.");
    setStoredCartId(id);
    return id;
  }, []);

  // add to cart
  const handleAddToCart = useCallback(async (product) => {
    if (!product?.variantId) {
      // No default variant → navigate to PDP
      window.location.href = `/products/${product.handle}`;
      return;
    }
    setAdding(s => ({ ...s, [product.id]: true }));
    try {
      const cartId = await ensureCartId();
      const res = await shopify(CART_LINES_ADD, {
        cartId,
        lines: [{ merchandiseId: product.variantId, quantity: 1 }],
      });
      const errs = res?.cartLinesAdd?.userErrors;
      if (errs?.length) throw new Error(errs.map(e => e.message).join("; "));

      const total = res?.cartLinesAdd?.cart?.totalQuantity ?? 0;
      // notify navbar badge
      try {
        window.dispatchEvent(new CustomEvent("cart:updated", { detail: { totalQuantity: total } }));
      } catch {}
    } catch (e) {
      alert(e?.message || "Could not add to cart.");
    } finally {
      setAdding(s => ({ ...s, [product.id]: false }));
    }
  }, [ensureCartId]);

  /* -------------------------------- renders ------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Separator />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-16">
        <Alert variant="destructive">
          <AlertTitle>Failed to load collection</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-16 text-center">
        <p className="text-lg">Collection not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-primary text-3xl md:text-4xl font-semibold tracking-tight text-primary text-center sm:text-left">
            {title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 text-center sm:text-left">
            {products.length} item{products.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-3 self-center sm:self-auto">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="title-asc">Title: A–Z</SelectItem>
              <SelectItem value="title-desc">Title: Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="mt-4" />

      {/* Grid with TopProducts styling */}
      {products.length === 0 ? (
        <div className="py-20 text-center text-neutral-600">No products in this collection.</div>
      ) : (
        <div className="mt-8 grid gap-7 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const busy = !!adding[product.id];

            return (
              <Card key={product.id} className="border-0 shadow-none text-center group">
                <Link
                  to={`/products/${product.handle}`}
                  aria-label={product.title}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ ["--tw-ring-color"]: BRAND }}
                >
                  <CardContent className="p-0">
                    {/* Image 3:4 + QUICK VIEW bar (matching TopProducts) */}
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

                    {/* Details — TopProducts spacing & fonts */}
                    <div className="px-1 pt-3 flex flex-col justify-center items-center gap-1.5">
                      {/* 🔧 Center-aligned title (with truncate and fixed height) */}
                      <h3
                        className="text-center w-full font-secondary text-[1.1rem] font-semibold text-[color:var(--brand-642,#642c44)] leading-[1.35] truncate"
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

                      {/* Add to Cart — stops navigation */}
                      <div className="w-full mt-1.5 flex justify-center items-center">
                        <Button
                          className="font-secondary font-semibold border-2"
                          style={{ backgroundColor: BRAND, borderColor: BRAND }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!product.available || busy) return;
                            handleAddToCart(product);
                          }}
                          disabled={!product.available || busy}
                          aria-disabled={!product.available || busy}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 8px 20px rgba(100,44,68,0.30)`)}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                        >
                          {!product.available
                            ? "Out of stock"
                            : busy
                            ? "Adding..."
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
    </div>
  );
}
