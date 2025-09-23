// src/components/StickyNav.jsx
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const BRAND = "#642c44";

// src/components/StickyNav.jsx
export const DEFAULT_NAV_ITEMS = [
  { key: "categories", label: "Categories", mode: "collections" },

  // ✅ use the actual Shopify handle from the collection URL
  { key: "back-in-stock-bestsellers", label: "Bestsellers", handle: "back-in-stock-bestsellers" },

  { key: "trousers", label: "Trousers", handle: "trousers" },

  // Keep label, handle can be short-dress or short-dresses; we'll handle both
  { key: "short-dress", label: "Short Dress", handle: "short-dress" },

  { key: "maxi-midi", label: "Maxi & Midi", handle: "maxi-midi-dress" },
  { key: "co-ords", label: "Co-ords", handle: "co-ords" },
];

export default function StickyNav({
  items = DEFAULT_NAV_ITEMS,
  value,
  defaultValue,
  onChange,
  className = "",
  headerHeight = 64,
  sticky = true,
}) {
  const [internal, setInternal] = useState(value ?? defaultValue ?? (items[0]?.key ?? ""));
  const activeKey = value ?? internal;

  const rootStyle = useMemo(
    () => (sticky ? { top: `${headerHeight}px`, zIndex: 30 } : undefined),
    [sticky, headerHeight]
  );

  return (
    <nav className={`w-full border-b bg-white ${className}`} aria-label="Section navigation" style={rootStyle}>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-3 py-4">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Button
              key={item.key}
              type="button"
              onClick={() => {
                if (!value) setInternal(item.key);
                onChange?.(item); // <-- bubble up selection
              }}
              size="sm"
              variant={isActive ? "default" : "outline"}
              aria-current={isActive ? "true" : "false"}
              className="rounded-md whitespace-nowrap transition-colors"
              style={isActive
                ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                : { borderColor: BRAND, color: BRAND }}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
