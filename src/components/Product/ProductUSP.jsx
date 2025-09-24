// src/components/ProductUSP.jsx
import React from "react";

/* Keep your existing icons */
import Shipping from "@/assets/icons/shipping.png";
import Cod from "@/assets/icons/cod.png";
import Return from "@/assets/icons/exchange.png";
import Fit from "@/assets/icons/fit.png";
import Made from "@/assets/icons/made.png";
import Secure from "@/assets/icons/secure.png";

/* Default items – unchanged */
const DEFAULT_USPS = [
  { icon: Secure,  text: "Secure Payment" },
  { icon: Cod,     text: "Cash On Delivery" },
  { icon: Made,    text: "Made In India" },
  { icon: Return,  text: "15 Days Exchange/Return" },
  { icon: Shipping,text: "Shipping All Over India" },
  { icon: Fit,     text: "Made to Fit Indian Body" }, // extra item still shown on large screens
];

/**
 * Props:
 * - items?: [{icon: string, text: string}]
 * - className?: string
 * - title?: string (hidden by default to match screenshot)
 */
export default function ProductUSP({
  items = DEFAULT_USPS,
  className = "",
  title = "",
}) {
  return (
    <section
      aria-label={title || "Product benefits"}
      className={`w-full bg-primary ${className}`}
    >
      {/* Centered content container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* (Optional) hidden title to keep layout clean like the image */}
        {title ? (
          <h2 className="sr-only">{title}</h2>
        ) : null}

        {/* Icons row */}
        <ul
          role="list"
          className="
            grid items-center justify-items-center
            grid-cols-2 gap-y-6 gap-x-6
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-6
            py-6 sm:py-8
            text-white
          "
        >
          {items.map((usp, i) => (
            <li key={i} role="listitem" className="flex flex-col items-center">
              <div className="grid place-items-center h-12 w-12 sm:h-14 sm:w-14 mb-3">
                <img
                  src={usp.icon}
                  alt=""               /* decorative icon */
                  aria-hidden="true"
                  loading="lazy"
                  draggable="false"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-center text-[13px] sm:text-sm font-medium leading-tight">
                {usp.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
