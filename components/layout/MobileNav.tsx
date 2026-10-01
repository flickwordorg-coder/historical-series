"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { isActiveNavItem, PRIMARY_NAV, type NavItem } from "@/lib/site/navigation";
import { rootPath } from "@/lib/site/routes";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation drawer.
 *
 * Client-only because it owns a disclosure state, focus trapping and body-scroll
 * locking. The active item comes from `usePathname()`, which is correct on the
 * first paint and on every client navigation — unlike a `window.location`
 * read, which needs a post-hydration effect to catch up.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="inline-flex size-10 items-center justify-center rounded-full text-parchment-100 ring-1 ring-inset ring-white/10 transition hover:bg-ink-800"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5">
          {open ? (
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-90">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
          />
          <nav
            id="mobile-navigation"
            aria-label="Mobile"
            className="absolute inset-x-0 top-0 max-h-dvh overflow-y-auto border-b border-white/10 bg-ink-900 px-5 pt-4 pb-8 shadow-[var(--shadow-panel)]"
          >
            <ul className="mt-3 space-y-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <MobileNavLink item={item} pathname={pathname} onNavigate={() => setOpen(false)} />
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-white/10 pt-5">
              <SearchShortcut />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

function MobileNavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isActiveNavItem(item, pathname);

  return (
    <>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "block rounded-xl px-4 py-3 font-display text-lg transition",
          active ? "bg-ink-800 text-gold-200" : "text-parchment-100 hover:bg-ink-800",
        )}
      >
        {item.label}
      </Link>
      {item.children?.length ? (
        <ul className="mt-1 space-y-1 pl-4">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="block rounded-lg px-4 py-2 text-sm text-parchment-300 transition hover:bg-ink-800 hover:text-parchment-100"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function SearchShortcut() {
  return (
    <Link
      href={rootPath("search")}
      onClick={(event) => {
        // Let the header dialog own "/" / ⌘K; otherwise jump to the full page.
        if (event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }));
      }}
      className="flex items-center justify-between rounded-xl px-4 py-3 text-parchment-200 transition hover:bg-ink-800"
    >
      <span>Search the site</span>
      <kbd className="rounded border border-white/15 px-2 py-0.5 text-xs text-parchment-400">/</kbd>
    </Link>
  );
}