// src/pages/Home.jsx
import React, { useEffect, useMemo, useState, Suspense } from "react";

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
import TrustBanner from "../TrustBanner";
import AvailBanner from "../home/AvailBanner";
import NewsLetter from "../home/NewsLetter";
import PrBanner from "../home/PrBanner";

// 🔹 Lazy-load preloader chunk only if needed (keeps initial JS small)
const Preloader = React.lazy(() => import("@/components/Preloader"));

/** Tabs for StickyNav (no Reviews; “Categories” shows collections) */
const NAV_TABS = [
  { key: "categories", label: "Categories", mode: "collections" },
  { key: "back-in-stock-bestsellers", label: "Bestsellers", handle: "back-in-stock-bestsellers" },
  { key: "trousers", label: "Trousers", handle: "trousers" },
  { key: "short-dress", label: "Short Dress", handle: "short-dress" },
  { key: "maxi-midi", label: "Maxi & Midi", handle: "maxi-midi-dress" },
  { key: "co-ords", label: "Co-ords", handle: "co-ords" },
];

export default function Home() {
  // --- Show preloader only once per browser (localStorage flag) ---
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    // Avoid SSR mismatch: decide in effect
    const seen = typeof window !== "undefined" && localStorage.getItem("intro_seen") === "1";
    setShowPreloader(!seen);
  }, []);

  useEffect(() => {
    if (showPreloader) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [showPreloader]);

  const handleEnd = () => {
    try { localStorage.setItem("intro_seen", "1"); } catch { /* no-op */ }
    setShowPreloader(false);
  };

  // --- StickyNav <-> TopProducts wiring ---
  const [activeTab, setActiveTab] = useState(NAV_TABS[0]);

  const topProps = useMemo(() => {
    if (activeTab.mode === "collections") {
      return { mode: "collections", title: "Shop By Category" };
    }
    return {
      mode: "products",
      handle: activeTab.handle || "top-products",
      title: activeTab.label || "Top Products",
    };
  }, [activeTab]);

  return (
    <main>
      {showPreloader && (
        <Suspense fallback={null}>
          <Preloader onVideoEnd={handleEnd} hintText="Click To Start" />
        </Suspense>
      )}

      {/* Page content (behind the fixed preloader) */}
      <HeroSection />
      <AvailBanner speed={20000} direction="right" gapClass="gap-16" />
      <CategoriesSection />
      <WatchAndBuy />
      <FlippingCard />
      <PrBanner/>
      <OfferSection />
      <InteractiveModelSection />
      <StatsCounter />
      <CoOrdsSection />

      <StickyNav
        items={NAV_TABS}
        value={activeTab.key}
        onChange={setActiveTab}
        sticky
        headerHeight={64}
      />

      <TopProducts
        key={`${topProps.mode}-${topProps.handle ?? "collections"}`}
        {...topProps}
      />

      <CuratedCollections />
      <Categories />
      <UspShowcase />
      <Testimonial />
      
      <NewsLetter />
      <PrBanner/>
      <DelanShiny />
    </main>
  );
}
