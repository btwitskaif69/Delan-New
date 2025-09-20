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
          flex flex-col items-center justify-center
          gap-6 sm:gap-7 lg:gap-8
          text-center
        "
      >

        {/* Big shiny headline */}
        <ShinyText
          text="Own It #TrustYourStyle"
          disabled={false}
          speed={7}
          className="
            custom-class
            font-semibold tracking-tight
            leading-[2]
            text-[clamp(2rem,8vw,7rem)]   /* responsive: 32px → ~96px */
            mx-auto
          "
        />
      </div>
    </section>
  );
};

export default DelanShiny;
