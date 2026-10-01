"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/**
 * The search input itself — shared by the header trigger, the dialog and the
 * server-rendered search page so there is only one input implementation.
 */
export interface SearchFieldProps {
  /** Controlled value. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial value, for server-rendered forms. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpen?: () => void;
  onClear?: () => void;
  placeholder?: string;
  label: string;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  role?: "searchbox" | "combobox";
  id?: string;
  name?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-activedescendant"?: string;
  "aria-autocomplete"?: "none" | "list" | "both";
  "aria-label"?: string;
}

const SIZES = {
  lg: "px-11 py-3.5 text-base",
  md: "px-10 py-2.5 text-sm",
  sm: "px-9 py-2 text-sm",
} as const;

const SHELL =
  "w-full rounded-full bg-ink-800/80 pr-10 text-left text-parchment-50 ring-1 ring-inset ring-white/10 transition placeholder:text-parchment-500";

function SearchIcon() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-parchment-400"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Trigger mode (`onOpen` with no `value`) renders a real `<button>`, not a
 * read-only input. A non-focusable-looking input that only responds to Enter
 * is a keyboard trap for anyone who does not guess the shortcut.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    value,
    defaultValue,
    onValueChange,
    onOpen,
    onClear,
    placeholder = "Search…",
    label,
    autoFocus = false,
    size = "md",
    className,
    role,
    id,
    name,
    onKeyDown,
    "aria-controls": ariaControls,
    "aria-expanded": ariaExpanded,
    "aria-activedescendant": ariaActivedescendant,
    "aria-autocomplete": ariaAutocomplete,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const isTrigger = typeof onOpen === "function" && typeof value === "undefined";
  const padding = SIZES[size];

  if (isTrigger) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={ariaLabel ?? label}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        className={cn(
          "relative block w-full rounded-full transition",
          className,
        )}
      >
        <SearchIcon />
        <span
          className={cn(
            SHELL,
            "flex items-center cursor-pointer hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-gold-400/70 focus-visible:outline-none",
            padding,
          )}
        >
          <span className="truncate text-parchment-500">{placeholder}</span>
        </span>
      </button>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon />

      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <input
        ref={ref}
        id={id}
        name={name}
        type="search"
        role={role}
        autoFocus={autoFocus}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        placeholder={placeholder}
        aria-label={ariaLabel ?? label}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        aria-activedescendant={ariaActivedescendant}
        aria-autocomplete={ariaAutocomplete}
        onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (typeof onOpen === "function" && event.key === "Enter") {
            event.preventDefault();
            onOpen();
          }
        }}
        className={cn(SHELL, "focus:bg-ink-800 focus:ring-gold-400/60", padding)}
      />

      {value && typeof onClear === "function" ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-parchment-400 transition hover:text-parchment-100"
        >
          <span className="sr-only">Clear search</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
            <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
