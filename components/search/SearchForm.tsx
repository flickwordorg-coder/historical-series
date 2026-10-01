import { SearchField } from "./SearchField";

/**
 * Search form for `/search/`.
 *
 * This is a server component on purpose: it is a real
 * `<form method="get" action="/search/">`, so submitting with JavaScript
 * disabled, blocked, or still loading navigates to `/search/?q=…` and the
 * server renders the results. No hydration, no client bundle, no focus
 * juggling — `SearchField` is only the client component the header and dialog
 * need, and the input here is inert HTML.
 */
export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      role="search"
      action="/search/"
      method="get"
      className="w-full max-w-xl"
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchField
            id="search-page-input"
            name="q"
            defaultValue={defaultValue}
            label="Search series, episodes, movies and articles"
            placeholder="Series, episode, movie or article…"
          />
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
        >
          Search
        </button>
      </div>

      <p className="mt-3 text-xs text-parchment-500">
        Tip: press <kbd className="rounded border border-white/15 px-1.5 py-0.5">/</kbd> anywhere
        on the site to open quick search.
      </p>
    </form>
  );
}
