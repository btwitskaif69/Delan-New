// src/pages/Home.jsx
import React, { useEffect, useState } from "react";

import HeroSection from "../home/HeroSection";
import CategoriesSection from "../home/CategoriesSection";
import InteractiveModelSection from "../home/InteractiveModelSection";
import StatsCounter from "../home/StatsCounter";
import CoOrdsSection from "../home/CoOrdsSection";
import TopProducts from "../home/TopProducts";
import StickyNav from "../StickyNav";
import TrousersSection from "../home/TrousersSection";
import CuratedCollections from "../home/CuratedCollections";
import Categories from "../home/Categories";
import ShortDressSection from "../home/ShortDressSection";
import MaxiMidi from "../home/MaxiMidi";
import UspShowcase from "../home/UspShowcase";
import WatchAndBuy from "../home/WatchAndBuy";
import OfferSection from "../home/OfferSection";
import Testimonial from "../home/Testimonial";
import FlippingCard from "../home/FlippingCard";
import DelanShiny from "../home/DelanShiny";

// ✅ point to the component location
import Preloader from "@/components/Preloader";

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(() => {
    const seen = localStorage.getItem("homeIntroSeen");
    return !seen;
  });

  useEffect(() => {
    if (showPreloader) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [showPreloader]);

  const handleEnd = () => {
    localStorage.setItem("homeIntroSeen", "1");
    setShowPreloader(false);
  };

  return (
    <main>
      {showPreloader && (
        <Preloader onVideoEnd={handleEnd} hintText="Click To Start" />
      )}

      {/* Your homepage content (will sit behind the fixed preloader) */}
      <HeroSection />
      <CategoriesSection />
      <InteractiveModelSection />
      <StatsCounter />
      <CoOrdsSection />
      <StickyNav />
      <TopProducts />
      <TrousersSection />
      <CuratedCollections />
      <Categories />
      <ShortDressSection />
      <MaxiMidi />
      <UspShowcase />
      <WatchAndBuy />
      <OfferSection />
      <Testimonial />
      <FlippingCard />
      <DelanShiny />
    </main>
  );
}
