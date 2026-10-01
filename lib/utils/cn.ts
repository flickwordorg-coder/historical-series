import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional class names with Tailwind conflict resolution.
 * The single class-composition helper for the whole app.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}