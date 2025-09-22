// src/components/ReviewList.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { shopify } from "@/lib/shopify";
import { GET_PRODUCT_REVIEWS } from "@/lib/queries";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

const BRAND = "var(--brand-642, #642c44)";

/* ===================== Stars (lucide) with fractional fill ===================== */
function RatingStars({
  value = 0,
  size = 16,
  className = "",
  "aria-label": ariaLabel,
}) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div
      className={`flex items-center gap-[2px] ${className}`}
      aria-label={ariaLabel ?? `${v} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        // fraction for this star (0..1)
        const f = Math.max(0, Math.min(1, v - i));
        // base outline
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {/* base outline (empty) */}
            <Star
              size={size}
              className="text-muted-foreground/40"
              aria-hidden
            />
            {/* filled portion, clipped */}
            {f > 0 && (
              <span
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: `${f * 100}%`, height: size }}
                aria-hidden
              >
                <Star
                  size={size}
                  className="text-[color:var(--brand-642,#642c44)]"
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ============================ helpers / summarize ============================= */
function coalesceAuthor(r = {}) {
  return r.firstName || r.author || r.name || r.user || "Valued Customer";
}
function coalesceText(r = {}) {
  return r.text || r.body || r.content || "";
}
function parseDateSafe(v) {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d : null;
}
function summarize(reviews = []) {
  if (!reviews.length) return { avg: 0, total: 0, buckets: [0, 0, 0, 0, 0] };
  const buckets = [0, 0, 0, 0, 0];
  const sum = reviews.reduce((s, r) => {
    const rate = Number(r.rate || 0);
    const idx = Math.max(1, Math.min(5, Math.round(rate))) - 1;
    buckets[idx] += 1;
    return s + rate;
  }, 0);
  return { avg: +(sum / reviews.length).toFixed(1), total: reviews.length, buckets };
}

function Avatar({ name = "User" }) {
  const initials = (name || "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
  return (
    <div
      className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold"
      style={{ backgroundColor: "rgba(100,44,68,0.12)", color: "var(--brand-642,#642c44)" }}
      aria-hidden
    >
      {initials || "U"}
    </div>
  );
}

/* ================================== main ================================== */
export default function ReviewList({
  metafieldNamespace = "air_reviews_product",
  metafieldKey = "data",
  initialCount = 4,
  loadMoreStep = 4,
  showSummary = true,
  showHistogram = true,
}) {
  const { handle } = useParams();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [reviews, setReviews] = React.useState([]);
  const [visible, setVisible] = React.useState(initialCount);
  const [sort, setSort] = React.useState("recent"); // recent | highest | lowest
  const [expanded, setExpanded] = React.useState({}); // idx -> boolean
  const [starFilter, setStarFilter] = React.useState(null); // 1..5 or null

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!handle) {
        setLoading(false);
        setReviews([]);
        return;
      }
      setLoading(true);
      setError("");

      try {
        // Pass only the variables your query expects (handle).
        const data = await shopify(GET_PRODUCT_REVIEWS, { handle });
        const mf = data?.product?.metafields?.[0];
        let parsed = [];
        if (mf?.value) {
          try {
            const payload = JSON.parse(mf.value);
            parsed = (payload?.reviews || []).filter((r) => r?.status === "approved");
          } catch (e) {
            console.error("Error parsing review JSON:", e);
          }
        }
        if (!cancelled) setReviews(parsed);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  /* ----------------------- derived (sort + filter) ----------------------- */
  const filtered = React.useMemo(() => {
    if (!starFilter) return reviews;
    // exact star bucket (rounded)
    return reviews.filter((r) => Math.round(Number(r.rate || 0)) === starFilter);
  }, [reviews, starFilter]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    if (sort === "highest") arr.sort((a, b) => (b.rate || 0) - (a.rate || 0));
    else if (sort === "lowest") arr.sort((a, b) => (a.rate || 0) - (b.rate || 0));
    else {
      // recent
      arr.sort((a, b) => {
        const da = parseDateSafe(a.createdAt || a.date);
        const db = parseDateSafe(b.createdAt || b.date);
        if (da && db) return db - da;
        return 0;
      });
    }
    return arr;
  }, [filtered, sort]);

  const { avg, total, buckets } = React.useMemo(() => summarize(reviews), [reviews]);

  /* ---------------------------- UI states ---------------------------- */
  if (loading) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-3 h-5 w-28" />
                <Skeleton className="mb-2 h-4 w-5/6" />
                <Skeleton className="mb-2 h-4 w-4/6" />
                <Skeleton className="mb-2 h-4 w-3/6" />
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Error loading reviews: {error}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!total) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-8">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to review!
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  /* -------------------------------- render -------------------------------- */
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8">
      <Card className="border-border/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl sm:text-2xl">Customer Reviews</CardTitle>

          {showSummary && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold" style={{ color: BRAND }}>
                  {avg}
                </span>
                <RatingStars value={avg} />
              </div>
              <span className="text-muted-foreground">
                ({total} {total === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          {/* Sort + filter row */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort:</span>
            <div className="inline-flex overflow-hidden rounded-full border border-border/70">
              {[
                { key: "recent", label: "Most recent" },
                { key: "highest", label: "Highest" },
                { key: "lowest", label: "Lowest" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={[
                    "px-3 py-1.5 text-xs sm:text-[13px] transition",
                    sort === opt.key
                      ? "bg-[color:var(--brand-642,#642c44)] text-white"
                      : "bg-background text-foreground/80",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {starFilter && (
              <Button
                variant="outline"
                className="ml-1 h-7 rounded-full px-3 text-xs"
                onClick={() => setStarFilter(null)}
              >
                Clear filter
              </Button>
            )}
          </div>

          {/* Histogram (click any bar to filter that star bucket) */}
          {showHistogram && (
            <div className="mt-3 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = buckets[star - 1] || 0;
                const pct = total ? Math.round((count / total) * 100) : 0;
                const active = starFilter === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarFilter((cur) => (cur === star ? null : star))}
                    className={[
                      "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-xs transition",
                      active ? "bg-[rgba(100,44,68,0.06)]" : "hover:bg-muted/60",
                    ].join(" ")}
                    aria-label={`Filter ${star}-star reviews`}
                  >
                    <span className="w-5 text-right">{star}</span>
                    <Star size={12} className="translate-y-[0.5px] text-foreground/70" />
                    <div className="relative h-2 flex-1 rounded bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-[color:var(--brand-642,#642c44)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews match this filter.
            </p>
          ) : (
            <>
              <ul className="space-y-6">
                {sorted.slice(0, visible).map((r, idx) => {
                  const author = coalesceAuthor(r);
                  const text = coalesceText(r);
                  const long = (text || "").length > 260;
                  const isOpen = !!expanded[idx];
                  const display = long && !isOpen ? `${text.slice(0, 260)}…` : text;
                  const date = parseDateSafe(r.createdAt || r.date);

                  return (
                    <li key={idx} className="pb-4">
                      <div className="mb-2 flex items-center gap-3">
                        <Avatar name={author} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[15px] font-medium">{author}</p>
                            <RatingStars value={r.rate} className="shrink-0" />
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {typeof r.rate === "number" ? `${r.rate}/5` : ""}{" "}
                            {date ? ` • ${date.toLocaleDateString()}` : ""}
                          </p>
                        </div>
                      </div>

                      {display ? (
                        <p className="text-foreground/90">{display}</p>
                      ) : (
                        <p className="text-muted-foreground">No comment</p>
                      )}

                      {long && (
                        <button
                          type="button"
                          className="mt-1 text-[13px] font-medium underline underline-offset-4"
                          style={{ color: BRAND }}
                          onClick={() =>
                            setExpanded((e) => ({ ...e, [idx]: !isOpen }))
                          }
                        >
                          {isOpen ? "Show less" : "Read more"}
                        </button>
                      )}

                      <Separator className="mt-4" />
                    </li>
                  );
                })}
              </ul>

              {visible < sorted.length && (
                <div className="mt-8 flex justify-center">
                  <Button
                    className="rounded-full px-6"
                    style={{ backgroundColor: BRAND }}
                    onClick={() => setVisible((v) => v + loadMoreStep)}
                  >
                    Load More Reviews
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
