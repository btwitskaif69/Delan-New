// src/components/SearchSidebar.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp, Trash2, ArrowUpRight } from "lucide-react";

const RECENT_KEY = "delanRecentSearches";
const MAX_RECENTS = 8;

function loadRecents() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveRecents(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
  } catch {}
}

export default function SearchSidebar({ open, onOpenChange }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState(() => loadRecents());
  const inputRef = useRef(null);

  // Autofocus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQ("");
    }
  }, [open]);

  // Derived state: CTA enabled only if there’s a query
  const canSearch = useMemo(() => q.trim().length > 0, [q]);

  const pushRecent = (term) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(
      0,
      MAX_RECENTS
    );
    setRecents(next);
    saveRecents(next);
  };

  const goSearch = (term) => {
    const text = (term ?? q).trim();
    if (!text) return;
    pushRecent(text);
    onOpenChange?.(false);
    nav(`/search?q=${encodeURIComponent(text)}`);
  };

  const clearRecents = () => {
    setRecents([]);
    saveRecents([]);
  };

  const popular = [
    "Dresses",
    "Maxi",
    "Co-ord",
    "Trousers",
    "XS",
    "Summer",
    "New Arrivals",
    "Sale",
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] sm:w-[520px] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Search</SheetTitle>
            {q && (
              <button
                className="rounded p-2 hover:bg-neutral-100"
                onClick={() => setQ("")}
                aria-label="Clear"
                title="Clear"
              >
                <X className="h-4 w-4 text-neutral-500" />
              </button>
            )}
          </div>

          {/* Input */}
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goSearch();
                if (e.key === "Escape") onOpenChange?.(false);
              }}
              placeholder="Search products…"
              className="h-8 w-full bg-transparent outline-none placeholder:text-neutral-400"
            />
            {canSearch && (
              <Button size="sm" className="h-8" onClick={() => goSearch()}>
                Search
              </Button>
            )}
          </div>
        </SheetHeader>

        <Separator className="shrink-0" />

        {/* Body (single scroll area) */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto px-5 py-5 [scrollbar-gutter:stable] pr-4 overscroll-contain">
            {/* If no query → show recents & popular */}
            {!canSearch ? (
              <>
                {/* Recent searches */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recent searches</h4>
                  {recents.length > 0 && (
                    <button
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
                      onClick={clearRecents}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                </div>

                {recents.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-500">No recent searches yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1.5">
                    {recents.map((r) => (
                      <li key={r}>
                        <button
                          onClick={() => goSearch(r)}
                          className="w-full flex items-center gap-3 rounded-md px-2 py-2 hover:bg-neutral-50 text-left"
                        >
                          <Clock className="h-4 w-4 text-neutral-500" />
                          <span className="truncate">{r}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Popular */}
                <h4 className="mt-6 text-sm font-medium">Popular right now</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popular.map((p) => (
                    <button
                      key={p}
                      onClick={() => goSearch(p)}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50"
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-neutral-500" />
                      {p}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Live “action” card */}
                <div className="rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-neutral-500" />
                      <div>
                        <p className="text-sm">
                          Search for <span className="font-medium">“{q.trim()}”</span>
                        </p>
                        <p className="text-xs text-neutral-500">Press Enter to view all results</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => goSearch()}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Placeholder suggestion blocks (hook up your predictive API here if desired) */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium">Suggestions</h4>
                  <ul className="mt-3 space-y-2">
                    {["in Women", "in Dresses", "in Trousers"].map((s) => (
                      <li key={s}>
                        <button
                          className="w-full rounded-md px-2 py-2 text-left hover:bg-neutral-50"
                          onClick={() => goSearch(`${q.trim()} ${s.replace("in ", "")}`)}
                        >
                          <span className="font-medium">{q.trim()}</span>{" "}
                          <span className="text-neutral-500">{s}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator className="shrink-0" />

        {/* Footer */}
        <SheetFooter className="px-5 pt-4 pb-5 gap-3 shrink-0">
          <Button
            className="w-full bg-[#4a1f33] hover:bg-[#3c1829]"
            disabled={!canSearch}
            onClick={() => goSearch()}
          >
            Search “{q.trim() || ""}”
          </Button>
          <Button variant="outline" className="w-full border-neutral-300" onClick={() => onOpenChange?.(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
