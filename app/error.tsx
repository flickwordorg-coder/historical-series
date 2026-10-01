"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary.
 *
 * The only place a retry button exists, because it is the only interaction that
 * genuinely needs client JavaScript — re-running a failed Server Component is
 * exactly what `reset()` is for.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporter (Sentry, etc.) in production.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-4 py-20">
      <p className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-crimson-300">
        <span aria-hidden="true" className="rule-gold h-px w-6" />
        Something went wrong
      </p>

      <h1 className="mt-3 text-display-xl text-parchment-50">
        We could not load this page
      </h1>

      <p className="mt-5 text-pretty text-base leading-relaxed text-parchment-300">
        The content service did not respond as expected. This is usually temporary — try again in a
        moment.
      </p>

      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-parchment-500">Reference: {error.digest}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
        >
          Try again
        </button>

        <Link
          href="/"
          className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-parchment-100 transition hover:border-gold-400/50"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
