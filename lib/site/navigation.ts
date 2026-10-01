/**
 * Navigation model. Both desktop and mobile nav render from this single array,
 * so a menu change happens in exactly one place.
 */

import { rootPath } from "./routes";

export interface NavItem {
  label: string;
  /** Path used for the link and for active-state matching. */
  href: string;
  /** Exact match required for the active state (used by the home crumb). */
  exact?: boolean;
  children?: NavItem[];
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/", exact: true },
  { label: "Series", href: rootPath("turkish-series") },
  { label: "Movies", href: rootPath("turkish-movies") },
  { label: "Categories", href: rootPath("categories") },
  { label: "Blog", href: rootPath("blog") },
];

export const FOOTER_SECTIONS: ReadonlyArray<{ title: string; items: NavItem[] }> = [
  {
    title: "Browse",
    items: [
      { label: "Turkish Series", href: rootPath("turkish-series") },
      { label: "Turkish Movies", href: rootPath("turkish-movies") },
      { label: "Categories", href: rootPath("categories") },
      { label: "Blog", href: rootPath("blog") },
      { label: "Search", href: rootPath("search") },
    ],
  },
  {
    // Filled from the CMS at render time — see components/layout/SiteFooter.tsx
    title: "Pages",
    items: [],
  },
];

/** Matches a pathname against the nav model for active-state styling. */
export function isActiveNavItem(item: NavItem, pathname: string): boolean {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (item.exact) return normalized === item.href;
  return normalized === item.href || normalized.startsWith(`${item.href}`);
}