"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PRIMARY_NAV, isActiveNavItem } from "@/lib/site/navigation";
import { cn } from "@/lib/utils";

/**
 * Primary navigation links.
 *
 * The only reason this is a client component is `usePathname()`, which is what
 * gives us a correct `aria-current="page"` on every route without forcing the
 * whole app to opt into dynamic rendering via `headers()`.
 *
 * It renders the same list in two shapes — a full bar on desktop and a
 * horizontally scrollable strip on mobile — so the menu is defined once.
 */
export function PrimaryNav({ variant }: { variant: "desktop" | "strip" }) {
  const pathname = usePathname();

  if (variant === "strip") {
    return (
      <ul className="flex items-center gap-1">
        {PRIMARY_NAV.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex items-center gap-1">
      {PRIMARY_NAV.map((item) => (
        <li key={item.href}>
          <NavLink item={item} pathname={pathname} />
        </li>
      ))}
    </ul>
  );
}

function NavLink({
  item,
  pathname,
  compact = false,
}: {
  item: (typeof PRIMARY_NAV)[number];
  pathname: string;
  compact?: boolean;
}) {
  const active = isActiveNavItem(item, pathname);

  if (compact) {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition",
          active
            ? "bg-ink-800 text-gold-200"
            : "text-parchment-300 hover:text-parchment-50",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative block rounded-full px-3.5 py-2 text-sm font-medium transition",
        active ? "text-gold-200" : "text-parchment-200 hover:text-parchment-50",
      )}
    >
      {item.label}
      {active ? (
        <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-px bg-gold-400/70" />
      ) : null}
    </Link>
  );
}