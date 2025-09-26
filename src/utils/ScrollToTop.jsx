// ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to page top on route change.
 * If URL has a #hash, scrolls to that element instead (with optional offset).
 *
 * @param {"auto" | "smooth"} behavior - scroll behavior; default "auto"
 * @param {number} offset - pixels to offset from top (e.g., fixed header); default 0
 * @param {boolean} enableHash - enable anchor scrolling for #hash; default true
 */
export default function ScrollToTop({
  behavior = "auto",
  offset = 0,
  enableHash = true,
}) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, try to scroll to that element
    if (enableHash && hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: behavior === "smooth" ? "smooth" : "auto",
        });
        return;
      }
    }

    // Otherwise, scroll to the top
    window.scrollTo({
      top: 0,
      behavior: behavior === "smooth" ? "smooth" : "auto",
    });
  }, [pathname, hash, behavior, offset, enableHash]);

  return null; // headless utility component
}
