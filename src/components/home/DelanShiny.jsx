// src/components/DelanShiny.jsx
"use client";

import React from "react";
import ShinyText from "../ShinyText";
import logo from "@/assets/images/Delan-logo.svg";

const DelanShiny = () => {
  return (
    <section className="w-full bg-accent">
      <div
        className="
          max-w-[1400px] mx-auto
          min-h-[30vh]
          px-4 sm:px-6 lg:px-10
          grid place-items-center
          text-center
        "
      >
        <img
          src={logo}
          alt="DELAN brand logo"
          className="w-40 h-auto mx-auto block"
        />

        <ShinyText
          text="Own It #TrustYourStyle"
          disabled={false}
          speed={6}
          className="
            block mx-auto text-center
            font-semibold tracking-tight
            leading-none                 /* remove extra line height */
            text-[clamp(2rem,8vw,7rem)]
            cormorant-garamond-700
            -mt-1 sm:-mt-2               /* nudge closer if needed */
          "
        />
      </div>
    </section>
  );
};

export default DelanShiny;
