// src/components/AvailBanner.jsx
import React from "react";
import ajio from "@/assets/logos/ajio.svg";
import amazon from "@/assets/logos/amazon.svg";
import flipkart from "@/assets/logos/flipkart.svg";
import meesho from "@/assets/logos/meesho.svg";
import myntra from "@/assets/logos/myntra.svg";

// Map each marketplace to its imported logo
const MARKETPLACES = [
  { name: "Myntra", alt: "Myntra", logo: myntra },
  { name: "Amazon", alt: "Amazon", logo: amazon },
  { name: "Flipkart", alt: "Flipkart", logo: flipkart },
  { name: "AJIO", alt: "AJIO", logo: ajio },
  { name: "Meesho", alt: "Meesho", logo: meesho },
];

const AvailBanner = () => {
  return (
    <div className="w-full bg-muted/30 py-8 overflow-hidden">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h2 className="cormorant-garamond-700 text-primary  text-3xl md:text-4xl lg:text-4xl">
          AVAILABLE ON
        </h2>
        <p className="text-primary montserrat-60">
          Shop from your favorite marketplaces
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Fade edges for a smooth scroll effect */}
        <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />

        {/* Continuous scroll */}
        <div className="flex animate-marquee">
          {/* First set of logos */}
          <div className="flex shrink-0 items-center justify-around gap-16 px-8">
            {MARKETPLACES.map((marketplace, index) => (
              <div
                key={`first-${index}`}
                className="flex h-20 w-36 items-center justify-center"
              >
                <img
                  src={marketplace.logo}
                  alt={marketplace.alt}
                  className="max-h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>

          {/* Duplicate set for seamless looping */}
          <div className="flex shrink-0 items-center justify-around gap-16 px-8">
            {MARKETPLACES.map((marketplace, index) => (
              <div
                key={`second-${index}`}
                className="flex h-20 w-36 items-center justify-center"
              >
                <img
                  src={marketplace.logo}
                  alt={marketplace.alt}
                  className="max-h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailBanner;
