// src/components/ProductUSP.jsx
import React from "react";
import { Card } from "@/components/ui/card";
/* Default items (use your PNGs/SVGs) */
import Shipping from "@/assets/icons/shipping.png";
import Cod from "@/assets/icons/cod.png";
import Return from "@/assets/icons/exchange.png";
import Fit from "@/assets/icons/fit.png";

const DEFAULT_USPS = [
  { icon: Shipping, text: "Free Shipping" },
  { icon: Cod, text: "COD Available" },
  { icon: Return, text: "15 Days Exchange/Return" },
  { icon: Fit, text: "Made to Fit Indian Body" },
];


// Brand variable you already use elsewhere
const BRAND = "var(--brand-642, #642c44)";

/**
 * Props:
 * - items?: [{icon: string, text: string}]
 * - title?: string
 * - className?: string
 */
export default function ProductUSP({
  items = DEFAULT_USPS,
  title = "",
  className = "",
}) {
  return (
    <section
      role="region"
      aria-label={title || "Product benefits"}
      className={`mx-auto w-full max-w-7xl px-4 py-8 ${className}`}
    >
      {title ? (
        <h2
          className="mb-6 text-center text-xl font-semibold"
          style={{ color: BRAND }}
        >
          {title}
        </h2>
      ) : null}

      <Card className="border-0 bg-transparent shadow-none">
        <div
          className="
            grid grid-cols-2 gap-6
            sm:grid-cols-4 sm:gap-10
            justify-items-center items-start
          "
        >
          {items.map((usp, i) => (
            <div
              key={i}
              className="
                group flex flex-col items-center text-center
                gap-3 sm:gap-4
              "
            >
              <div
                className="
                  grid place-items-center rounded-full
                  h-16 w-16 sm:h-20 sm:w-20
                  transition-transform duration-200 group-hover:scale-[1.03]
                "
              >
                <img
                  src={usp.icon}
                  alt={usp.text}
                  loading="lazy"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                  draggable="false"
                />
              </div>

              <p
                className="text-[13px] sm:text-sm font-medium"
                style={{ color: BRAND }}
              >
                {usp.text}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

