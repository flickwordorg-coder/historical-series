/**
 * Validated Sanity env access shared by the Studio config and the CLI.
 * Throws a readable error instead of letting an empty project id fail obscurely.
 */
function required(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `[sanity] Missing ${name}. Copy .env.example to .env.local (or .env) and set it before running the Studio.`,
    );
  }
  return trimmed;
}

export const projectId = required(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

export const apiVersion = process.env.SANITY_API_VERSION?.trim() || "2026-09-30";