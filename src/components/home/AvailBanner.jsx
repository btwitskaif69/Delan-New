// src/components/AvailBanner.jsx
import React from "react";
import ajio from "@/assets/logos/ajio.svg";
import amazon from "@/assets/logos/amazon.svg";
import flipkart from "@/assets/logos/flipkart.svg";
import meesho from "@/assets/logos/meesho.svg";
import myntra from "@/assets/logos/myntra.svg";

const MARKETPLACES = [
  { name: "Myntra", alt: "Myntra", logo: myntra },
  { name: "Amazon", alt: "Amazon", logo: amazon },
  { name: "Flipkart", alt: "Flipkart", logo: flipkart },
  { name: "AJIO", alt: "AJIO", logo: ajio },
  { name: "Meesho", alt: "Meesho", logo: meesho },
];

const LogoSet = ({ ariaHidden = false }) => (
  <ul
    className="flex w-1/2 items-center justify-around"
    aria-hidden={ariaHidden || undefined}
  >
    {MARKETPLACES.map((mp, i) => (
      <li
        key={`${mp.name}-${i}-${ariaHidden ? "b" : "a"}`}
        className="flex-none h-20 w-36 flex items-center justify-center"
        title={mp.name}
      >
        <img
          src={mp.logo}
          alt={mp.alt}
          className="max-h-15 w-auto object-contain"
          loading="lazy"
        />
      </li>
    ))}
  </ul>
);

const AvailBanner = () => {
  return (
    <div className="w-full bg-muted/30 py-8 overflow-hidden">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h2 className="cormorant-garamond-700 text-primary text-3xl md:text-4xl">
          AVAILABLE ON
        </h2>
        <p className="text-primary montserrat-500">Shop from your favorite marketplaces</p>
      </div>

      {/* Marquee */}
      <div className="relative group overflow-hidden bg-secondary py-5">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />

        {/* Track: 200% width, two identical 50% halves */}
        <div
          className="flex w-[200%] animate-marquee pause-on-hover"
          style={{ ["--marquee-duration"]: "22s" }}
        >
          <LogoSet />
          <LogoSet ariaHidden />
        </div>
      </div>
    </div>
  );
};

export default AvailBanner;
