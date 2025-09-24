// src/components/TrustBanner.jsx
import React, { useState } from "react";
import Banner from "@/assets/images/prbanner.png";

const ROUNDED = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

const TrustBanner = ({
  src = Banner,
  alt = "Trusted by premium brands",
  href,                   // optional link
  rounded = "xl",         // none | sm | md | lg | xl | 2xl | full
  className = "",         // extra wrapper classes
  eager = false,          // set true for above-the-fold banners
}) => {
  const [loaded, setLoaded] = useState(false);
  const Tag = href ? "a" : "div";
  const roundedClass = ROUNDED[rounded] ?? ROUNDED.xl;

  return (
    <Tag
      href={href}
      aria-label={href ? alt : undefined}
      className={[
        "block relative overflow-hidden border border-border bg-background shadow-sm",
        roundedClass,
        className,
      ].join(" ")}
    >
      {/* Skeleton while the GIF loads */}
      {!loaded && <div className="aspect-[21/9] w-full animate-pulse bg-muted" />}

      <img
        src={typeof src === "string" ? src : src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        className={["w-full h-auto", loaded ? "block" : "hidden"].join(" ")}
      />
    </Tag>
  );
};

export default TrustBanner;
