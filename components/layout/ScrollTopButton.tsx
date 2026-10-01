"use client";

import { useEffect, useState } from "react";

/**
 * "Back to top" control.
 *
 * One of only four client components in the app, and the smallest: it appears
 * only after the reader has scrolled past the hero.
 */
export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 bottom-4 z-70 grid size-11 place-items-center rounded-full bg-ink-800/90 text-parchment-100 ring-1 ring-white/10 backdrop-blur transition hover:bg-ink-700 hover:text-gold-200 sm:right-6 sm:bottom-6"
    >
      <span className="sr-only">Back to top</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5">
        <path d="m6 14 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}