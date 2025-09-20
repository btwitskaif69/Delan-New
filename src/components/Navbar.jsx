// src/components/Navbar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Search, ShoppingCart, Truck, Menu as MenuIcon, ChevronRight } from "lucide-react";
import logo from "@/assets/images/Delan-logo.svg";

// bring your query + client from your own files
import { GET_MENU } from "@/lib/queries";
import { shopify } from "@/lib/shopify";

const toRelative = (url) => {
  if (!url) return "#";
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url;
  }
};

const PRIMARY_TEXT = "text-primary text-[#4a1f33]"; // uses tailwind 'primary' if defined, plus fallback

export default function Navbar() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [cartCount] = useState(0);

  // hide on scroll down, show on scroll up
  const [showHeader, setShowHeader] = useState(true);
  const [lastY, setLastY] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 50) setShowHeader(false);
      else setShowHeader(true);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  // fetch menu
  useEffect(() => {
    (async () => {
      try {
        const d = await shopify(GET_MENU, { handle: "main-menu" });
        setItems(d?.menu?.items || []);
      } catch (e) {
        console.error("Menu load failed:", e);
        setItems([]);
      }
    })();
  }, []);

  const main = useMemo(() => items ?? [], [items]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white text-primary transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* ===== Top bar ===== */}
      <div className="flex items-center justify-between border-b border-[#eee5ea] px-4 md:px-10 py-3">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-black/5">
              <MenuIcon className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] sm:w-[380px] p-0">
              <MobileMenu items={main} />
            </SheetContent>
          </Sheet>

          <Link
            to="/tools/track-order"
            className="hidden lg:inline-flex items-center gap-2 text-sm hover:opacity-80 font-secondary"
          >
            <Truck className="h-4 w-4" />
            Track Order
          </Link>
        </div>

        {/* Center brand */}
        <div className="text-center">
          <Link to="/" className="block">
            {/* Tailwind doesn't have h-17; use a custom value */}
            <img src={logo} alt="DELAN" className="mx-auto h-[68px] w-auto" />
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          <Link to="/search" className="inline-flex items-center hover:opacity-80" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>

          <Link to="/account/login" className="hidden sm:inline text-sm hover:opacity-80 font-secondary">
            Login <span className="mx-1 opacity-60">/</span> Sign Up
          </Link>

          <Link to="/cart" className="relative inline-flex items-center hover:opacity-80" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 grid h-4 w-4 place-items-center rounded-full bg-[#4a1f33] text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ===== Bottom nav (desktop) ===== */}
      <div className="hidden md:flex justify-center border-b border-[#eee5ea]">
        <NavigationMenu>
          <NavigationMenuList className="gap-1">
            {main.map((m) => {
              const hasChildren = (m.items?.length ?? 0) > 0;

              // — no children: simple link —
              if (!hasChildren) {
                return (
                  <NavigationMenuItem key={m.title} className="relative">
                    <Link
                      to={toRelative(m.url)}
                      className={`font-secondary px-4 py-4 text-xs uppercase hover:bg-black/5 rounded transition ${
                        location.pathname === toRelative(m.url) ? "text-black" : PRIMARY_TEXT
                      }`}
                    >
                      {m.title}
                    </Link>
                  </NavigationMenuItem>
                );
              }

              // — with children: Popover anchored to this item —
              return (
                <NavigationMenuItem key={m.title} className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="group font-secondary px-4 py-4 text-md uppercase rounded bg-transparent hover:bg-black/5 inline-flex items-center text-primary"
                      >
                        {m.title}
                        <span
                          className="ml-1 text-[10px] transition-transform group-data-[state=open]:rotate-180"
                          aria-hidden
                        >
                          ▾
                        </span>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      side="bottom"
                      align="start"
                      sideOffset={0}
                      className="p-0 bg-white border border-[#eee5ea] shadow-[0_6px_18px_rgba(0,0,0,0.08)] rounded-md min-w-[240px] z-50"
                    >
                      <ul className="py-2">
                        {m.items.map((c) => (
                          <li key={c.title}>
                            <Link
                              to={toRelative(c.url)}
                              className="font-secondary flex items-center gap-2 px-4 py-2 text-[13px] leading-5 hover:bg-black/5"
                            >
                              <span aria-hidden className="text-lg leading-none">•</span>
                              <span>{c.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </PopoverContent>
                  </Popover>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}

/* ---------- Mobile slide-out menu ---------- */
function MobileMenu({ items }) {
  const [open, setOpen] = useState({});
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="border-b border-[#eee5ea] px-4 py-4">
        <Link to="/" className="block">
          <img src={logo} alt="DELAN" className="h-10 w-auto" />
        </Link>
      </div>

      <nav className="px-2 py-2">
        <Link
          to="/tools/track-order"
          className="font-secondary flex items-center gap-2 rounded px-3 py-3 text-sm hover:bg-black/5"
        >
          <Truck className="h-4 w-4" /> Track Order
        </Link>

        <div className="my-2 h-px bg-[#eee5ea]" />

        {items.map((m, i) => {
          const hasChildren = (m.items?.length ?? 0) > 0;
          if (!hasChildren) {
            return (
              <Link
                key={m.title}
                to={toRelative(m.url)}
                className="font-secondary block rounded px-3 py-3 text-base hover:bg-black/5"
              >
                {m.title}
              </Link>
            );
          }
          const isOpen = !!open[i];
          return (
            <div key={m.title}>
              <button
                onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
                className="font-secondary flex w-full items-center justify-between rounded px-3 py-3 text-base hover:bg-black/5"
                aria-expanded={isOpen}
              >
                <span>{m.title}</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="pl-3">
                  {m.items.map((c) => (
                    <Link
                      key={c.title}
                      to={toRelative(c.url)}
                      className="font-secondary block rounded px-3 py-2 text-[15px] hover:bg-black/5"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-[#eee5ea] px-2 py-3">
        <Link to="/account/login" className="font-secondary block rounded px-3 py-2 text-sm hover:bg-black/5">
          Login
        </Link>
        <Link to="/account/register" className="font-secondary block rounded px-3 py-2 text-sm hover:bg-black/5">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
