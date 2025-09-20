// src/components/CartSidebar.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { shopify } from "@/lib/shopify";

/* ----------------------------- GraphQL queries ---------------------------- */
const CART_QUERY = /* GraphQL */ `
  query CartQuery($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost { subtotalAmount { amount currencyCode } }
            merchandise {
              ... on ProductVariant {
                id
                title
                sku
                price { amount currencyCode }
                image { url altText }
                product { id title handle }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { message }
    }
  }
`;

const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { message }
    }
  }
`;

/* --------------------------------- Helpers -------------------------------- */
const CART_ID_KEY = "shopifyCartId";
const TIMEOUT_MS = 12000;

const getStoredCartId = () => { try { return localStorage.getItem(CART_ID_KEY) || null; } catch { return null; } };
const setStoredCartId = (id) => { try { localStorage.setItem(CART_ID_KEY, id); } catch {} };
const clearStoredCartId = () => { try { localStorage.removeItem(CART_ID_KEY); } catch {} };

// let Navbar know the total quantity changed
function emitCartQty(qty) {
  try {
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { totalQuantity: qty ?? 0 } }));
  } catch {}
}

// Accepts either fetch Response or plain object; throws on GraphQL errors
async function unwrapAsync(resp) {
  let r = resp;
  if (r && typeof r.json === "function") { try { r = await r.json(); } catch {} }
  const body = r?.data ?? r;
  if (Array.isArray(r?.errors) && r.errors.length) throw new Error(r.errors.map(e => e.message).join("; "));
  return body;
}

function withTimeout(promise, ms = TIMEOUT_MS, label = "Request timed out") {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error(label)), ms))]);
}

function fmt(amount, code) {
  const a = Number.parseFloat(amount ?? 0);
  if (!Number.isFinite(a)) return "₹0";
  const locale = code === "INR" ? "en-IN" : undefined;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code || "INR",
      maximumFractionDigits: code === "INR" ? 0 : 2,
    }).format(a);
  } catch {
    return `${code || "₹"} ${a.toFixed(code === "INR" ? 0 : 2)}`;
  }
}

/* -------------------------------- Component -------------------------------- */
export default function CartSidebar({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [lineBusy, setLineBusy] = useState({});

  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;
  const lines = useMemo(() => cart?.lines?.edges?.map(e => e.node) ?? [], [cart]);

  const ensureCart = useCallback(async () => {
    let id = getStoredCartId();
    if (!id) {
      const raw = await withTimeout(shopify(CART_CREATE, { lines: [] }));
      const d = await unwrapAsync(raw);
      const errs = d?.cartCreate?.userErrors;
      if (errs?.length) throw new Error(errs.map(e => e.message).join("; "));
      id = d?.cartCreate?.cart?.id;
      if (!id) throw new Error("Unable to create cart.");
      setStoredCartId(id);
    }
    return id;
  }, []);

  const setCartAndEmit = useCallback((nextCart) => {
    setCart(nextCart);
    emitCartQty(nextCart?.totalQuantity ?? 0);
  }, []);

  const fetchCart = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const id = await ensureCart();
      const raw = await withTimeout(shopify(CART_QUERY, { cartId: id }));
      const data = await unwrapAsync(raw);

      if (!data?.cart) {
        clearStoredCartId();
        const fresh = await ensureCart();
        const raw2 = await withTimeout(shopify(CART_QUERY, { cartId: fresh }));
        const data2 = await unwrapAsync(raw2);
        setCartAndEmit(data2?.cart ?? null);
      } else {
        setCartAndEmit(data.cart);
      }
    } catch (e) {
      console.error("[Cart] fetchCart error:", e);
      setError(e?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  }, [ensureCart, setCartAndEmit]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(fetchCart, 50); // allow sheet to animate first
    return () => clearTimeout(t);
  }, [open, fetchCart]);

  const updateQty = async (lineId, nextQty) => {
    if (!cart?.id || !lineId) return;
    if (nextQty < 1) return removeLine(lineId);
    setLineBusy(b => ({ ...b, [lineId]: true }));
    try {
      const raw = await withTimeout(
        shopify(CART_LINES_UPDATE, { cartId: cart.id, lines: [{ id: lineId, quantity: nextQty }] })
      );
      await unwrapAsync(raw);
      await fetchCart();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Could not update quantity.");
    } finally {
      setLineBusy(b => ({ ...b, [lineId]: false }));
    }
  };

  const removeLine = async (lineId) => {
    if (!cart?.id || !lineId) return;
    setLineBusy(b => ({ ...b, [lineId]: true }));
    try {
      const raw = await withTimeout(
        shopify(CART_LINES_REMOVE, { cartId: cart.id, lineIds: [lineId] })
      );
      await unwrapAsync(raw);
      await fetchCart();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Could not remove item.");
    } finally {
      setLineBusy(b => ({ ...b, [lineId]: false }));
    }
  };

  const EmptyState = (
    <div className="flex h-full flex-col items-center justify-center text-center px-6 py-10">
      <div className="rounded-full border border-neutral-200 p-4 mb-4">
        <ShoppingBag className="h-8 w-8 text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">Your cart is empty</h3>
      <p className="mt-1 text-sm text-neutral-600">Let’s add something you’ll love.</p>
      <Button className="mt-6" onClick={() => onOpenChange?.(false)}>
        Continue shopping
      </Button>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Use a single native scroller in the middle, and keep header/footer fixed.
         Reserve gutter for the scrollbar so content never hides under it. */}
      <SheetContent className="w-[92vw] sm:w-[440px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-5 pt-5 pb-3 shrink-0">
          <SheetTitle className="text-lg">Your Cart</SheetTitle>
        </SheetHeader>

        <Separator className="shrink-0" />

        {/* BODY — the only scrollable region */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="h-full overflow-y-auto px-5 py-5 [scrollbar-gutter:stable] pr-4 overscroll-contain">
              <CartSkeleton />
              <CartSkeleton />
              <CartSkeleton />
            </div>
          ) : error ? (
            <div className="p-6">
              <p className="text-sm text-red-600">{error}</p>
              <Button className="mt-3" variant="secondary" onClick={fetchCart}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : lines.length === 0 ? (
            EmptyState
          ) : (
            <div className="h-full overflow-y-auto px-5 py-5 [scrollbar-gutter:stable] pr-4 overscroll-contain">
              <ul className="space-y-5">
                {lines.map((l) => {
                  const v = l.merchandise;
                  const img = v?.image?.url;
                  const alt = v?.image?.altText || v?.product?.title || v?.title || "Product";
                  const title = v?.product?.title || "Untitled";
                  const variant = v?.title && v.title !== "Default Title" ? v.title : "";
                  const lineTotal = l?.cost?.subtotalAmount;
                  const busy = !!lineBusy[l.id];

                  return (
                    <li key={l.id} className="flex gap-4">
                      <Link
                        to={`/products/${v?.product?.handle ?? ""}`}
                        className="block shrink-0 rounded-lg overflow-hidden bg-neutral-100"
                        aria-label={title}
                      >
                        <img
                          src={img || "https://via.placeholder.com/120x160?text=Delan"}
                          alt={alt}
                          className="h-24 w-20 object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-900">{title}</p>
                            {variant ? (
                              <p className="truncate text-xs text-neutral-500 mt-0.5">{variant}</p>
                            ) : null}
                          </div>

                          <button
                            className="rounded p-1 hover:bg-neutral-100 disabled:pointer-events-none"
                            onClick={() => removeLine(l.id)}
                            disabled={busy}
                            aria-label="Remove item"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4 text-neutral-500" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          {/* Qty stepper */}
                          <div className="inline-flex items-center h-9 rounded-full border border-neutral-200">
                            <button
                              className="h-9 w-9 grid place-items-center hover:bg-neutral-50 rounded-l-full disabled:opacity-50"
                              onClick={() => updateQty(l.id, l.quantity - 1)}
                              disabled={busy || l.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 text-sm tabular-nums">{l.quantity}</span>
                            <button
                              className="h-9 w-9 grid place-items-center hover:bg-neutral-50 rounded-r-full disabled:opacity-50"
                              onClick={() => updateQty(l.id, l.quantity + 1)}
                              disabled={busy}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Line total */}
                          <span className="shrink-0 whitespace-nowrap tabular-nums text-sm font-semibold min-w-[88px] text-right">
                            {fmt(lineTotal?.amount, lineTotal?.currencyCode)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <Separator className="shrink-0" />

        {/* FOOTER — pinned */}
        <SheetFooter className="px-5 pt-4 pb-5 gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Subtotal</span>
            <span className="text-base font-semibold tabular-nums whitespace-nowrap">
              {fmt(subtotal?.amount ?? 0, subtotal?.currencyCode ?? "INR")}
            </span>
          </div>
          <p className="text-xs text-neutral-500">Taxes & shipping calculated at checkout.</p>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => onOpenChange?.(false)} className="border-neutral-300">
              Continue shopping
            </Button>
            <Button
              disabled={!checkoutUrl || lines.length === 0}
              onClick={() => { if (checkoutUrl) window.open(checkoutUrl, "_blank", "noopener,noreferrer"); }}
              className="bg-[#4a1f33] hover:bg-[#3c1829]"
            >
              Checkout
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* -------------------------------- Skeleton -------------------------------- */
function CartSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="h-24 w-20 rounded-lg bg-neutral-200" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-2/3 bg-neutral-200 rounded" />
        <div className="h-3 w-1/3 bg-neutral-200 rounded" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-9 w-28 bg-neutral-200 rounded-full" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}
