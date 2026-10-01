"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import type { SearchResult } from "@/lib/sanity/types";
import { rootPath } from "@/lib/site/routes";

import { SearchField } from "./SearchField";

/**
 * Header search dialog.
 *
 * Deliberately the only "search UI" client component — it is the one surface
 * that genuinely needs interactivity. It:
 *  - opens with `/` or ⌘K, closes with Escape
 *  - debounces requests and aborts stale ones
 *  - is an ARIA modal dialog with a combobox-style results list
 *  - links straight to each result's ROOT-LEVEL slug
 *
 * A full server-rendered search page also exists at `/search/`, so search works
 * without JavaScript.
 */
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [activeIndex, setActiveIndex] = useState(-1);

  const dialogRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listboxId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  /* Global shortcuts: "/" and ⌘K / Ctrl+K open the dialog. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.key === "/" && !isTyping) || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Lock body scroll + focus management while open. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = dialogRef.current;
    const focusTarget = node?.querySelector<HTMLInputElement>("input[type=search]");
    focusTarget?.focus();

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, close]);

  /* Debounced search with cancellation. */
  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      abortRef.current?.abort();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Search failed (${response.status})`);
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results ?? []);
        setActiveIndex(-1);
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setStatus("error");
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // Results for a previous query must not stay on screen once the query drops
  // below the two-character threshold. Gating at render time keeps the debounce
  // effect free of setState calls while still showing only current matches.
  const query = term.trim();
  const hasQuery = query.length >= 2;
  const visibleResults = hasQuery ? results : [];

  return (
    <>
      <SearchField
        onOpen={() => setOpen(true)}
        label="Search series, episodes, movies and articles"
      />

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-100 flex items-start justify-center bg-ink-950/80 px-4 pt-[10vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-panel)] bg-ink-900 shadow-[var(--shadow-panel)] ring-1 ring-white/10"
          >
            <div className="border-b border-white/10 p-3">
              <SearchField
                autoFocus
                value={term}
                onValueChange={setTerm}
                onClear={() => setTerm("")}
                label="Search series, episodes, movies and articles"
                placeholder="Search a series, episode number, movie or article…"
                size="lg"
                role="combobox"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-expanded
                aria-activedescendant={
                  activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
                }
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((index) =>
                      Math.min(index + 1, visibleResults.length - 1),
                    );
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.max(index - 1, -1));
                  }
                }}
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
              {!hasQuery ? (
                <p className="px-5 py-8 text-center text-sm text-parchment-400">
                  Type at least two characters to search.
                </p>
              ) : status === "loading" ? (
                <p className="px-5 py-8 text-center text-sm text-parchment-400" aria-live="polite">
                  Searching…
                </p>
              ) : status === "error" ? (
                <p className="px-5 py-8 text-center text-sm text-crimson-300">
                  Search is unavailable right now. Try the{" "}
                  <Link href="/search/" className="underline underline-offset-4">
                    full search page
                  </Link>
                  .
                </p>
              ) : results.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-parchment-400">
                  No matches for “{query}”.
                </p>
              ) : (
                <ul id={listboxId} role="listbox" aria-label="Search results" className="divide-y divide-white/5">
                  {visibleResults.map((result, index) => (
                    <li key={result._id} role="option" aria-selected={index === activeIndex}>
                      <Link
                        id={`${listboxId}-${index}`}
                        href={result.slug ? rootPath(result.slug) : "/"}
                        className={`flex items-center gap-3 px-5 py-3 transition hover:bg-ink-800 ${
                          index === activeIndex ? "bg-ink-800" : ""
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-parchment-50">{result.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-parchment-400">
                            {[result.typeLabel, result.meta, result.subtitle].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-parchment-500"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[0.6875rem] text-parchment-500">
              <span>
                <kbd className="rounded border border-white/15 px-1.5 py-0.5">↑</kbd>{" "}
                <kbd className="rounded border border-white/15 px-1.5 py-0.5">↓</kbd> to navigate
              </span>
              <Link href="/search/" className="underline underline-offset-4 hover:text-gold-200">
                Full search
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}