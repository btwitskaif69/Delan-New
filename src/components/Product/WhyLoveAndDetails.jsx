// src/components/product/WhyLoveAndDetails.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { shopify } from "@/lib/shopify";
import { GET_PRODUCT_BY_HANDLE } from "@/lib/queries";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const BRAND = "var(--brand-642, #642c44)";

/** Prefer HTML; fallback to plain description if needed */
const pickDescription = (p) =>
  (p?.descriptionHtml && String(p.descriptionHtml).trim()) ||
  (p?.description && `<p>${escapeHtml(p.description)}</p>`) ||
  "";

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Try several common param names so it works regardless of your route key
function resolveHandle(override, params = {}) {
  if (override) return override;
  return (
    params.handle ??
    params.productHandle ??
    params.product ??
    params.slug ??
    params.id ??
    ""
  );
}

/**
 * WhyLoveAndDetails
 * Fetches product description from Shopify using route handle via shopify()
 */
export default function WhyLoveAndDetails({
  handle: handleOverride,
  sections = DEFAULT_SECTIONS,
  enableReview = true,
  onSubmitReview,
}) {
  const params = useParams();
  const handle = resolveHandle(handleOverride, params);

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [loveHtml, setLoveHtml] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    // ⬇️ ADDED LOGGING
    console.log("Component mounted. URL Params:", params);
    console.log("Resolved product handle for API call:", handle);

    (async () => {
      if (!handle) {
        console.error("DEBUG: No handle found. Aborting fetch.");
        setLoading(false);
        setErr("Missing product handle.");
        return;
      }

      setLoading(true);
      setErr("");
      try {
        const data = await shopify(GET_PRODUCT_BY_HANDLE, { handle });
        
        // ⬇️ UNCOMMENTED AND ENHANCED LOGGING
        console.debug("✅ Shopify API Response:", { handle, data });

        const product = data?.product;
        const html = pickDescription(product);

        if (!cancelled) {
          if (html) {
            setLoveHtml(html);
          } else {
            // This error will trigger if product is null or has no description
            console.warn("DEBUG: Product not found in response or has no description.", { product });
            setErr("Product not found or has no description.");
            setLoveHtml("<p>No description available.</p>");
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("❌ Shopify API call failed:", e);
          setErr(e?.message || "Failed to load description");
          setLoveHtml("<p>No description available.</p>");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle]);

  // simple local review state
  const [rating, setRating] = React.useState(0);
  const [text, setText] = React.useState("");
  const submit = (e) => {
    e.preventDefault();
    onSubmitReview?.({ rating, text });
  };

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2 md:gap-8">
      {/* LEFT: Why you’ll love this (Shopify description) */}
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Why You’ll Love This</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-9/12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-8/12 animate-pulse rounded bg-muted" />
            </div>
          ) : err && !loveHtml ? (
            <p className="text-sm text-muted-foreground">{err}</p>
          ) : (
            <div
              className="space-y-3 leading-7 text-foreground/90
                         [&_strong]:font-semibold [&_a]:underline
                         [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: loveHtml }}
            />
          )}
        </CardContent>
      </Card>

      {/* RIGHT: Accordion + Write a review */}
      <div>
        <div className="rounded-lg border border-border/70">
          <Accordion type="single" collapsible className="w-full">
            {sections.map((s) => (
              <AccordionItem key={s.id} value={s.id}>
                <AccordionTrigger className="px-4 py-3 text-[15px] sm:text-base">
                  {s.title}
                </AccordionTrigger>
                <AccordionContent>
                  <Separator className="mb-3" />
                  <div
                    className="px-4 pb-4 leading-7 text-foreground/90
                               [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: s.html }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {enableReview && (
          <div className="mt-6 rounded-lg border border-border/70 p-4">
            <h3 className="mb-2 text-lg font-semibold" style={{ color: BRAND }}>
              Write a Review
            </h3>

            {/* Stars */}
            <div className="mb-3 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => {
                const active = i <= rating;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    aria-label={`${i} star${i > 1 ? "s" : ""}`}
                    className="rounded transition hover:scale-[1.05]
                               focus-visible:outline-none focus-visible:ring-2
                               focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Star
                      size={22}
                      className={
                        active
                          ? "text-[color:var(--brand-642,#642c44)]"
                          : "text-muted-foreground/50"
                      }
                      {...(active ? { fill: "currentColor" } : {})}
                    />
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="space-y-3">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="rounded-full px-6"
                  style={{ backgroundColor: BRAND }}
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

/* Defaults for the accordion (HTML strings) */
const DEFAULT_SECTIONS = [
  {
    id: "highlights",
    title: "Highlights",
    html: `
      <ul>
        <li>Built-in cups that stay in place</li>
        <li>No see-through</li>
        <li>Anti-camel toe</li>
        <li>Chlorine resistant</li>
      </ul>
    `,
  },
  {
    id: "fabric",
    title: "Fabric Details",
    html: `
      <ul>
        <li>80% Nylon – Comfort & freedom in/out of water</li>
        <li>20% Spandex – Durability and stretch</li>
      </ul>
    `,
  },
  {
    id: "wash",
    title: "Wash-Care Details",
    html: `
      <ul>
        <li>Line dry in shade</li>
        <li>Do not bleach</li>
      </ul>
    `,
  },
];