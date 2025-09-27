// ScrollToTop.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * PUSH/REPLACE => scroll to top or #hash
 * POP (back/forward) => restore previous scroll position for that entry
 */
export default function ScrollToTop({
  behavior = "auto",      // for top/hash scrolls
  restoreBehavior = "auto", // for POP restores (usually "auto")
  offset = 0,
  enableHash = true,
}) {
  const location = useLocation();          // { pathname, search, hash, key }
  const navType = useNavigationType();     // "PUSH" | "POP" | "REPLACE"
  const positionsRef = useRef(new Map());  // key -> scrollY
  const prevKeyRef = useRef(location.key);
  const tickingRef = useRef(false);

  // Ensure consistent, app-controlled restoration
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => { window.history.scrollRestoration = prev || "auto"; };
    }
  }, []);

  // Persist the current entry's scroll position while the user scrolls
  useEffect(() => {
    const key = location.key || "root";
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        positionsRef.current.set(key, window.scrollY);
        tickingRef.current = false;
      });
    };
    // Save once immediately as a baseline
    positionsRef.current.set(key, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.key]);

  // On key change, snapshot the old page's final position
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    positionsRef.current.set(prevKey, window.scrollY);
    prevKeyRef.current = location.key;
  }, [location.key]);

  // Act on navigation
  useEffect(() => {
    // Back/forward => restore saved position if available
    if (navType === "POP") {
      const saved = positionsRef.current.get(location.key);
      if (typeof saved === "number") {
        window.scrollTo({ top: saved, behavior: restoreBehavior });
        return;
      }
      // fall through to hash/top if nothing saved
    }

    // For new pages (PUSH/REPLACE) or no saved position on POP
    if (enableHash && location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, y), behavior });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior });
  }, [location.pathname, location.hash, location.key, navType, behavior, restoreBehavior, offset, enableHash]);

  return null;
}
