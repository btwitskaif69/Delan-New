// src/components/product/ProductHeader.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { shopify } from "@/lib/shopify";
import InstagramCircles from "./InstagramCircles";

/* ---------------- Shopify query (no Apollo) ---------------- */
const GET_PRODUCT_BY_HANDLE = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      options(first: 10) { id name values }
      images(first: 20) { edges { node { url altText } } }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            sku
            image { url altText }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
      metafields(identifiers: [
        { namespace: "air_reviews_product", key: "data" },
        { namespace: "air_reviews_product", key: "review_avg" },
        { namespace: "air_reviews_product", key: "review_count" }
      ]) {
        key
        namespace
        type
        value
      }
    }
  }
`;

/* ---------------- static coupons from screenshot ------------- */
/* Feel free to edit the copy/colors here */
const STATIC_COUPONS = [
  {
    code: "88BSOE65RGH9",
    text: "20% off Cotton Products",
    bg: "rgba(100,44,68,0.08)",
    fg: "var(--brand-642, #642c44)",
  },
  {
    code: "C8KRF1G9PCDJ",
    text: "Free shipping on all products • For all countries",
    bg: "rgba(100,44,68,0.06)",
    fg: "var(--brand-642, #642c44)",
  },
  {
    code: "4B5P1ZFT3XN1",
    text: "Free shipping on all products • For all countries",
    bg: "rgba(100,44,68,0.06)",
    fg: "var(--brand-642, #642c44)",
  },
];

/* Small list that renders the static coupons with a Copy button */
function StaticCoupons({ coupons = STATIC_COUPONS }) {
  const [copied, setCopied] = useState("");

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1400);
    } catch {
      // no-op
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {coupons.map((c, i) => (
        <div
          key={c.code + i}
          className="w-full rounded-lg px-4 sm:px-5 py-3 sm:py-4"
          style={{ backgroundColor: c.bg, color: c.fg }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
            <p className="text-[13px] sm:text-[14px] font-medium text-current text-center sm:text-left">
              {c.text}
            </p>

            <button
              type="button"
              onClick={() => copy(c.code)}
              className="inline-flex items-center rounded-full border border-current px-3 py-1 text-xs sm:text-[13px] font-semibold hover:opacity-90"
              aria-label={`Copy code ${c.code}`}
              title="Copy code"
            >
              {copied === c.code ? "Copied!" : c.code}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- utils ---------------- */
const BRAND = "var(--brand-642, #642c44)";
const first = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : undefined);
const edgeNodes = (edges = []) => edges.map((e) => e?.node).filter(Boolean);

function formatMoney(amount) {
  const n = Number(amount ?? 0);
  return `Rs. ${n.toLocaleString("en-IN")}`;
}
function pickVariant(product, selectedOptions) {
  const edges = product?.variants?.edges || [];
  for (const e of edges) {
    const v = e?.node;
    if (!v) continue;
    const ok = (v.selectedOptions || []).every(
      (o) => selectedOptions?.[o?.name] === o?.value
    );
    if (ok) return v;
  }
  return null;
}

/* ------------------------------------------------------------------ */
export default function ProductHeader({ handle: handleProp, onAddToCart }) {
  const { handle: handleFromRoute } = useParams();
  const handle = handleProp ?? handleFromRoute;

  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /* fetch product */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!handle) return;
      setLoading(true);
      setErr("");
      try {
        const data = await shopify(GET_PRODUCT_BY_HANDLE, { handle });
        const p = data?.product || null;
        if (!p || cancelled) return;

        const defaults = {};
        (p.options || []).forEach((opt) => {
          const v = first(opt.values);
          if (opt?.name && v) defaults[opt.name] = v;
        });

        const images = edgeNodes(p.images?.edges);
        const firstImg = first(images);

        setProduct(p);
        setSelectedOptions(defaults);
        setMainImage(firstImg || null);

        const v = pickVariant(p, defaults);
        setSelectedVariant(v || first(p.variants?.edges)?.node || null);

        try {
          const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const updated = [handle, ...history.filter((h) => h !== handle)].slice(0, 5);
          localStorage.setItem("recentlyViewed", JSON.stringify(updated));
        } catch {}
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr(e?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [handle]);

  /* recompute selection */
  useEffect(() => {
    if (!product) return;
    const v = pickVariant(product, selectedOptions);
    setSelectedVariant(v || null);
    if (v?.image?.url) {
      setMainImage({ url: v.image.url, altText: v.image.altText || product.title });
    } else {
      const firstImg = first(edgeNodes(product.images?.edges));
      if (firstImg) setMainImage(firstImg);
    }
  }, [product, selectedOptions]);

  /* reviews */
  const { approvedReviews, avgRating } = useMemo(() => {
    const mf = (product?.metafields || []).find(
      (m) => m?.namespace === "air_reviews_product" && m?.key === "data"
    );
    let reviews = [];
    if (mf?.value) {
      try { reviews = JSON.parse(mf.value)?.reviews || []; } catch {}
    }
    const approved = reviews.filter((r) => r?.status === "approved");
    const avg = approved.length
      ? (approved.reduce((s, r) => s + Number(r?.rate || 0), 0) / approved.length).toFixed(1)
      : null;
    return { approvedReviews: approved, avgRating: avg };
  }, [product]);

  /* loading / error */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="aspect-[4/5] w-full rounded-lg bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-12 w-full rounded bg-muted animate-pulse" />
            <div className="h-12 w-full rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  if (err || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">
        {err || "Product not found"}
      </div>
    );
  }

  const images = edgeNodes(product.images?.edges);
  const price =
    selectedVariant?.price?.amount ??
    first(product.variants?.edges)?.node?.price?.amount ??
    "0";
  const compareAt = selectedVariant?.compareAtPrice?.amount;
  const inStock = Boolean(selectedVariant?.availableForSale);

  /* handlers */
  const onSelectOption = (name, value) =>
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  const onIncQty = () => setQuantity((q) => q + 1);
  const onDecQty = () => setQuantity((q) => Math.max(1, q - 1));
  const handleAddToCart = () => {
    if (!inStock || !selectedVariant?.id) return;
    if (typeof onAddToCart === "function") {
      onAddToCart(selectedVariant.id, quantity);
    } else {
      console.log("Add to cart:", selectedVariant.id, "qty:", quantity);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
        {/* LEFT: Gallery */}
        <div className="md:pl-2">
          {/* md+: thumbs LEFT of main image */}
          <div className="flex gap-3 sm:gap-4">
            <div className="hidden md:flex md:flex-col md:gap-3 shrink-0">
              {images.map((img, i) => {
                const active = mainImage?.url === img.url;
                return (
                  <button
                    key={img.url + i}
                    onClick={() => setMainImage(img)}
                    aria-label={`Thumbnail ${i + 1}`}
                    className={[
                      "overflow-hidden rounded-lg border",
                      active
                        ? "ring-2 ring-offset-2 ring-[var(--brand-642,#642c44)]"
                        : "border-border",
                    ].join(" ")}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || product.title}
                      loading="lazy"
                      className="h-24 w-20 object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {/* Main image */}
            <div className="relative w-full">
              {mainImage ? (
                <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-lg">
                  <img
                    src={mainImage.url}
                    alt={mainImage.altText || product.title}
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <div className="aspect-[4/5] w-full rounded-lg bg-muted" />
              )}
            </div>
          </div>

          {/* <md: horizontal thumb strip */}
          <div className="mt-3 flex gap-2 sm:gap-3 md:hidden overflow-x-auto no-scrollbar">
            {images.map((img, i) => {
              const active = mainImage?.url === img.url;
              return (
                <button
                  key={img.url + i}
                  onClick={() => setMainImage(img)}
                  aria-label={`Thumbnail ${i + 1}`}
                  className={[
                    "h-16 w-12 shrink-0 overflow-hidden rounded-md border",
                    active
                      ? "ring-2 ring-offset-2 ring-[var(--brand-642,#642c44)]"
                      : "border-border",
                  ].join(" ")}
                >
                  <img
                    src={img.url}
                    alt={img.altText || product.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Header (sticky on large) */}
        <div className="md:pr-2 lg:sticky lg:top-8">
          <section className="space-y-5 sm:space-y-6">
            {/* Title + subtitle */}
            <div>
              <h1
                className="
                  text-2xl sm:text-3xl lg:text-[44px]
                  leading-[1.15] font-semibold tracking-tight text-primary
                  cormorant-garamond-700
                "
              >
                {product.title}
              </h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground montser">
                Designed for Timeless Elegance
              </p>
            </div>

            {/* Price + rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-2xl sm:text-[28px] lg:text-[30px] font-semibold"
                  style={{ color: BRAND }}
                >
                  {formatMoney(price)}
                </span>
                {compareAt && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatMoney(compareAt)}
                  </span>
                )}
              </div>

              <div className="hidden h-5 w-px bg-border sm:block" />

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" className="translate-y-[1px]" fill="#f6c343">
                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {avgRating ? (
                  <span>
                    {avgRating}/5 ({approvedReviews.length} {approvedReviews.length === 1 ? "review" : "reviews"})
                  </span>
                ) : (
                  <span>No reviews yet</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-border" />

            {/* Options */}
            <div className="space-y-4 sm:space-y-5">
              {product.options.map((opt) => (
                <div key={opt.id} className="space-y-2">
                  <div className="text-[11px] sm:text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    {opt.name}:{" "}
                    <span className="normal-case text-foreground">
                      {selectedOptions[opt.name]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {opt.values.map((val) => {
                      const active = selectedOptions[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => onSelectOption(opt.name, val)}
                          aria-pressed={active}
                          aria-label={`${opt.name} ${val}`}
                          className={[
                            "inline-flex h-9 sm:h-10 min-w-9 sm:min-w-10 items-center justify-center rounded-full border px-3 sm:px-4 text-sm transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            active
                              ? "border-transparent text-white"
                              : "border-border bg-background text-foreground",
                          ].join(" ")}
                          style={{ backgroundColor: active ? BRAND : undefined }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Qty + Add to Cart + Wishlist */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-3">
                {/* Quantity */}
                <div className="inline-flex h-11 sm:h-12 items-center rounded-full border border-border bg-background">
                  <button
                    type="button"
                    onClick={onDecQty}
                    aria-label="Decrease quantity"
                    className="h-11 sm:h-12 w-11 sm:w-12 text-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    −
                  </button>
                  <span className="w-11 sm:w-12 text-center text-base font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={onIncQty}
                    aria-label="Increase quantity"
                    className="h-11 sm:h-12 w-11 sm:w-12 text-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={[
                    "h-11 sm:h-12 rounded-full text-[13px] sm:text-[14px] font-semibold text-white",
                    "transition hover:opacity-95",
                    "w-full sm:flex-1",
                    !inStock && "opacity-60 cursor-not-allowed",
                  ].join(" ")}
                  style={{ backgroundColor: BRAND }}
                >
                  {inStock ? "ADD TO CART" : "SOLD OUT"}
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => console.log("Wishlist")}
                  aria-label="Add to wishlist"
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-xl border border-border bg-background transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="mx-auto translate-y-[1px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12.1 21.35l-1.1-1.0C5.14 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.59 4.81 14.26 4 16 4 18.5 4 20.5 6 20.5 8.5c0 3.78-3.14 6.86-8.0 11.84l-.4.41z" />
                  </svg>
                </button>
              </div>

              {/* 🔥 Static coupon list with copy buttons */}
              <StaticCoupons />

              <InstagramCircles />
            </div>
          </section>

          <div className="mt-6 sm:mt-8 h-px w-full bg-border" />
        </div>
      </div>
    </main>
  );
}
