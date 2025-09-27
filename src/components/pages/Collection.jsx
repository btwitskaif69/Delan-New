// src/pages/CollectionPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import Delivery from "@/assets/icons/7days.svg";

// ✅ Queries
import { CART_CREATE, CART_LINES_ADD } from "@/lib/queries";
import { shopify } from "@/lib/shopify";

// --- Define collection query separately ---
const GET_COLLECTION_BY_HANDLE = `
  query GetCollection($handle: String!) {
    collection(handle: $handle) {
      id
      title
      description
      image {
        url
        altText
      }
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
            metafield(namespace: "reviews", key: "rating") {
              value
            }
          }
        }
      }
    }
  }
`;

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
    // rating parsing (supports number or JSON { value })
    let ratingValue = 0;
    const ratingField = node?.metafield?.value;
    if (ratingField) {
      try {
        const parsed = JSON.parse(ratingField);
        ratingValue = Number.parseFloat(parsed?.value ?? 0) || 0;
      } catch {
        const n = Number(ratingField);
        if (Number.isFinite(n)) ratingValue = n;
      }
    }

    // images (take first & second)
    const imgs = node?.images?.edges ?? [];
    const img1 = imgs[0]?.node;
    const img2 = imgs[1]?.node;

    const firstVariant = node?.variants?.edges?.[0]?.node;

    // Avoid duplicating same URL as hover image
    const img1Url = img1?.url || "https://via.placeholder.com/600x800";
    const img2Url = img2?.url && img2?.url !== img1?.url ? img2.url : null;

    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      price: node.priceRange?.minVariantPrice?.amount,
      currency: node.priceRange?.minVariantPrice?.currencyCode,
      imageUrl: img1Url,
      altText: img1?.altText || node.title,
      secondImageUrl: img2Url,
      secondAltText: img2?.altText || img1?.altText || node.title,
      ratingValue: Math.max(0, Math.min(5, Math.round(ratingValue))),
      variantId: firstVariant?.id || null,
      available: !!firstVariant?.availableForSale,
    };
  });
}

const getStoredCartId = () => {
  try {
    return localStorage.getItem(CART_ID_KEY) || null;
  } catch {
    return null;
  }
};
const setStoredCartId = (id) => {
  try {
    localStorage.setItem(CART_ID_KEY, id);
  } catch {}
};

/* ------------------------------ main component --------------------------- */
export default function CollectionPage() {
  const { handle } = useParams();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [rawProducts, setRawProducts] = useState([]);
  const [error, setError] = useState("");

  const [sort, setSort] = useState("featured");
  const [adding, setAdding] = useState({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await shopify(GET_COLLECTION_BY_HANDLE, { handle });
        if (cancelled) return;

        const col = data?.collection;
        if (!col) {
          setTitle("");
          setRawProducts([]);
        } else {
          setTitle(col.title || "");
          setDescription(col.description || "");
          setBannerImage(col.image?.url || "https://via.placeholder.com/1200x400");
          setRawProducts(parseProducts(col));
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load collection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle]);

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
        break;
    }
    return arr;
  }, [rawProducts, sort]);

  const ensureCartId = useCallback(async () => {
    let id = getStoredCartId();
    if (id) return id;
    const res = await shopify(CART_CREATE, { lines: [] });
    const errs = res?.cartCreate?.userErrors;
    if (errs?.length) throw new Error(errs.map((e) => e.message).join("; "));
    id = res?.cartCreate?.cart?.id;
    if (!id) throw new Error("Cart creation failed.");
    setStoredCartId(id);
    return id;
  }, []);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!product?.variantId) {
        window.location.href = `/products/${product.handle}`;
        return;
      }
      setAdding((s) => ({ ...s, [product.id]: true }));
      try {
        const cartId = await ensureCartId();
        const res = await shopify(CART_LINES_ADD, {
          cartId,
          lines: [{ merchandiseId: product.variantId, quantity: 1 }],
        });
        const errs = res?.cartLinesAdd?.userErrors;
        if (errs?.length) throw new Error(errs.map((e) => e.message).join("; "));

        const total = res?.cartLinesAdd?.cart?.totalQuantity ?? 0;
        try {
          window.dispatchEvent(
            new CustomEvent("cart:updated", { detail: { totalQuantity: total } })
          );
        } catch {}
      } catch (e) {
        alert(e?.message || "Could not add to cart.");
      } finally {
        setAdding((s) => ({ ...s, [product.id]: false }));
      }
    },
    [ensureCartId]
  );

  /* -------------------------------- renders ------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <Skeleton className="h-64 w-full mb-8" />
        <div className="flex items-end justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Separator />
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
    <div className="mx-auto max-w-full px-0 md:px-0 py-0">
      {/* 🔥 Banner with Image & Description */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px]">
        <img
          src={bannerImage}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 flex flex-col bg-black/30 justify-center items-center text-center px-6">
          <h1 className="cormorant-garamond-700 uppercase text-3xl md:text-4xl lg:text-4xl text-accent drop-shadow-lg">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-3xl text-sm md:text-base text-gray-100">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Header with sorting */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        <h1 className="cormorant-garamond-700 uppercase text-primary text-3xl md:text-4xl lg:text-4xl">
          {title}
        </h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="mt-1 text-sm text-neutral-500 text-center sm:text-left">
            {products.length} item{products.length === 1 ? "" : "s"}
          </p>

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

        {/* Grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center text-neutral-600">
            No products in this collection.
          </div>
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
      <div className="relative">
        <AspectRatio ratio={3 / 4} className="rounded-2xl overflow-hidden bg-rose-50">
          <div className="relative h-full w-full transition-transform duration-300">
            <img
              src={product.imageUrl}
              alt={product.altText}
              className="absolute inset-0 h-full w-full object-cover select-none transition-opacity duration-300 group-hover:opacity-0"
              draggable="false"
              loading="lazy"
              decoding="async"
            />
            {/* Hover image if available */}
            {product.secondImageUrl && (
              <img
                src={product.secondImageUrl}
                alt={product.secondAltText}
                className="absolute inset-0 h-full w-full object-cover select-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                draggable="false"
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        </AspectRatio>
      </div>

      <div className="px-1 pt-3 flex flex-col justify-center items-center gap-1.5">
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

        <div className="w-full mt-1.5 flex justify-center items-center gap-3">
          {/* Buy Now Button */}
          <Button
            className="font-secondary font-semibold border-2 px-4"
            style={{ backgroundColor: BRAND, borderColor: BRAND }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!product.available) return;
              window.location.href = `/checkout?product=${product.id}`;
            }}
            disabled={!product.available}
          >
            {product.available ? "Buy Now" : "Out of stock"}
          </Button>

          {/* Add to Cart Button with Icon */}
<Button
  className="font-secondary font-semibold border-2 flex justify-center items-center"
  style={{ backgroundColor: BRAND, borderColor: BRAND }}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available || busy) return;
    handleAddToCart(product);
  }}
  disabled={!product.available || busy}
>
  {busy ? (
    "Adding..."
  ) : (
    <ShoppingBag />
  )}
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
    </div>
  );
}
