import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const BRAND = "#642c44";

/** Default nav tabs (no 'Reviews') */
export const DEFAULT_NAV_ITEMS = [
  { key: "categories",  label: "Categories",  mode: "collections" }, // special: shows collections
  { key: "bestsellers", label: "Bestsellers", handle: "bestsellers" },
  { key: "trousers",    label: "Trousers",    handle: "trousers" },
  { key: "short-dress",       label: "Short Dress", handle: "short-dresses" },
  { key: "maxi-midi",   label: "Maxi & Midi", handle: "maxi-midi-dress" },
  { key: "co-ords",     label: "Co-ords",     handle: "co-ords" },
];

export default function StickyNav({
  items = DEFAULT_NAV_ITEMS,
  value,                // controlled active key (optional)
  defaultValue,         // uncontrolled initial key
  onChange,             // (item) => void
  className = "",
  headerHeight = 64,    // if you make this sticky under a fixed header
  sticky = true,        // keep it sticky at top
}) {
  const [internal, setInternal] = useState(
    value ?? defaultValue ?? (items[0]?.key ?? "")
  );

  const activeKey = value ?? internal;

  const rootStyle = useMemo(
    () => (sticky ? {top: `${headerHeight}px`, zIndex: 30 } : undefined),
    [sticky, headerHeight]
  );

  return (
    <nav
      className={`w-full border-b bg-white ${className}`}
      aria-label="Section navigation"
      style={rootStyle}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-3 py-4">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Button
              key={item.key}
              type="button"
              onClick={() => {
                if (!value) setInternal(item.key);
                onChange?.(item); // bubble up the selected tab (mode/handle/label)
              }}
              size="sm"
              variant={isActive ? "default" : "outline"}
              aria-current={isActive ? "true" : "false"}
              className="rounded-md whitespace-nowrap transition-colors"
              style={
                isActive
                  ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                  : { borderColor: BRAND, color: BRAND }
              }
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
