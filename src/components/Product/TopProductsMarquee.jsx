// src/components/TopProductsMarquee.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { shopify } from "@/lib/shopify";
import { GET_TOP_PRODUCTS } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

/**
 * Props:
 * - handle: Shopify collection handle (default "top-products")
 * - speed: seconds for one full loop (default 35, same as Marquee.jsx)
 * - gap: CSS length for gap between badges (default "1.25rem", same as Marquee.jsx)
 * - pauseOnHover: boolean (default true)
 * - bgClass: tailwind classes for the ribbon background (default "bg-secondary")
 */
export default function TopProductsMarquee({
  handle = "top-products",
  speed = 35,
  gap = "1.25rem",
  pauseOnHover = true,
  bgClass = "bg-secondary",
}) {
  const [items, setItems] = useState([]); // product nodes
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await shopify(GET_TOP_PRODUCTS, { handle });
        const nodes = (data?.collection?.products?.edges ?? [])
          .map((e) => e.node)
          .filter(Boolean);
        if (!cancelled) setItems(nodes);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  // Duplicate once for seamless loop across exactly one width.
  const lane = useMemo(() => [...items, ...items], [items]);

  // Loading: pill-ish placeholders so ribbon height stays consistent with the final UI
  if (loading) {
    return (
      <div className={`w-full overflow-hidden border-b ${bgClass}`}>
        <div className="mx-auto max-w-[1400px] px-3 py-2 sm:px-6">
          <div className="flex items-center gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-44 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (err || items.length === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden border-b ${bgClass}`}
      style={{
        // same soft edge fade as your Marquee.jsx
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
      role="region"
      aria-label="Top products marquee"
    >
      {/* Group wrapper allows pause-on-hover */}
      <div
        className="group mx-auto max-w-[1400px] px-3 py-2 sm:px-6"
        style={{ ["--dur"]: `${speed}s`, ["--gap"]: gap }}
      >
        {/* Moving lane */}
        <div
          data-marquee-lane
          className="flex w-max items-center motion-reduce:animate-none"
          style={{
            gap: "var(--gap)",
            animation: "marquee var(--dur) linear infinite",
            willChange: "transform",
          }}
        >
          {lane.map((p, i) => (
            <ProductBadge key={`${p.id}-${i}`} product={p} />
          ))}
        </div>

        {/* Pause on hover (scoped) */}
        {pauseOnHover && (
          <style>{`
            .group:hover > [data-marquee-lane] { animation-play-state: paused; }
          `}</style>
        )}
      </div>

      {/* Keyframes (scoped here) */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes marquee { from { transform: none; } to { transform: none; } }
        }
      `}</style>
    </div>
  );
}

/* ---------- Badge chip (tiny thumbnail + truncated title) ---------- */
function ProductBadge({ product }) {
  const img = product?.images?.edges?.[0]?.node;
  const src = img?.url || "";
  const alt = img?.altText || product?.title || "Product";

  return (
    <Link
      to={`/products/${product.handle}`}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
      aria-label={product?.title || "Product"}
    >
      <Badge
        variant="secondary"
        className="inline-flex h-8 items-center whitespace-nowrap px-3 py-1 text-[13px] sm:text-sm text-black"
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="mr-2 h-6 w-6 rounded-sm object-cover"
          />
        ) : (
          <span className="mr-2 inline-block h-6 w-6 rounded-sm bg-muted" />
        )}
        <span className="max-w-[220px] truncate">
          {product?.title || "Untitled"}
        </span>
      </Badge>
    </Link>
  );
}
