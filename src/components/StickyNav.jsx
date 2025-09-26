import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export const DEFAULT_NAV_ITEMS = [
  { key: "categories", label: "Categories", mode: "collections" },
  { key: "back-in-stock-bestsellers", label: "Bestsellers", handle: "back-in-stock-bestsellers" },
  { key: "trousers", label: "Trousers", handle: "trousers" },
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
  // Handles internal state for uncontrolled component usage
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? items[0]?.key ?? "");

  // Use the controlled `value` prop if provided, otherwise fall back to internal state
  const activeKey = value ?? internalValue;

  const rootStyle = useMemo(
    () => (sticky ? { top: `${headerHeight}px`, zIndex: 30 } : undefined),
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
                // Only set internal state if the component is not controlled
                if (value === undefined) {
                  setInternalValue(item.key);
                }
                onChange?.(item); // Notify parent of the change
              }}
              size="sm"
              variant={isActive ? "default" : "outline"}
              aria-current={isActive ? "true" : "false"}
              className={`rounded-md whitespace-nowrap ${
                !isActive
                  ? "text-primary border-primary hover:text-primary bg-white!"
                  : ""
              }`}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

