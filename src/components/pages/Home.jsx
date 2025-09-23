// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";

import HeroSection from "../home/HeroSection";
import CategoriesSection from "../home/CategoriesSection";
import InteractiveModelSection from "../home/InteractiveModelSection";
import StatsCounter from "../home/StatsCounter";
import CoOrdsSection from "../home/CoOrdsSection";
import TopProducts from "../home/TopProducts";
import StickyNav from "../StickyNav"; // <- make sure this is the updated tab-style StickyNav
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

// Preloader overlay
import Preloader from "@/components/Preloader";

/** Tabs for StickyNav (no Reviews; “Categories” shows collections) */
const NAV_TABS = [
  { key: "categories",  label: "Categories",  mode: "collections" }, // special mode
  { key: "bestsellers", label: "Bestsellers", handle: "bestsellers" },
  { key: "trousers",    label: "Trousers",    handle: "trousers" },
  { key: "short",       label: "Short Dress", handle: "short-dresses" },
  { key: "maxi-midi",   label: "Maxi & Midi", handle: "maxi-midi-dress" },
  { key: "co-ords",     label: "Co-ords",     handle: "co-ords" },
];

export default function Home() {
  // --- Preloader: show every visit (your current behavior) ---
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    if (showPreloader) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [showPreloader]);

  const handleEnd = () => setShowPreloader(false);

  // --- StickyNav <-> TopProducts wiring ---
  const [activeTab, setActiveTab] = useState(NAV_TABS[0]); // default: Categories

  // Compute props for TopProducts based on active tab
  const topProps = useMemo(() => {
    if (activeTab.mode === "collections") {
      // Show a grid of collections
      return { mode: "collections", title: "Shop By Category" };
    }
    // Show products from a specific collection handle
    return {
      mode: "products",
      handle: activeTab.handle || "top-products",
      title: activeTab.label || "Top Products",
    };
  }, [activeTab]);

  return (
    <main>
      {showPreloader && <Preloader onVideoEnd={handleEnd} hintText="Click To Start" />}

      {/* Page content (sits behind the fixed preloader) */}
      <HeroSection />
      <CategoriesSection />
      <WatchAndBuy />
      <OfferSection />
      <InteractiveModelSection />
      <StatsCounter />
      <CoOrdsSection />

      {/* StickyNav tabs control TopProducts (no scrolling behavior) */}
      <StickyNav
        items={NAV_TABS}
        value={activeTab.key}
        onChange={setActiveTab}    // StickyNav will pass back the selected item object
        sticky
        headerHeight={64}          // adjust if your global header height differs
      />

      {/* Re-render TopProducts whenever tab changes */}
      <TopProducts
        key={`${topProps.mode}-${topProps.handle ?? "collections"}`} // force remount for clean loaders
        {...topProps}
      />

      {/* The rest of your sections (optional to keep/show) */}
      {/* <TrousersSection /> */}
      <CuratedCollections />
      <Categories />
      {/* <ShortDressSection /> */}
      {/* <MaxiMidi /> */}
      <UspShowcase />
      <Testimonial />
      <FlippingCard />
      <DelanShiny />
    </main>
  );
}
