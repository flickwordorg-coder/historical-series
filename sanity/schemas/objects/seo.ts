import { defineField, defineType } from "sanity";
import type { SlugSourceContext } from "@sanity/types";

import { RESERVED_SLUGS } from "../../../lib/site/routes";
import { apiVersion } from "../../env";

/**
 * Flat-slug authority for the Studio.
 *
 * A slug is the public URL, so it must be:
 *  1. unique across ALL document types (a series and a category may never share
 *     one, otherwise routing becomes ambiguous), and
 *  2. not a slug owned by a Next.js route segment (`search`, `blog`, …).
 *
 * The same reserved list lives in `lib/site/routes.ts` — one source of truth.
 */

const RESERVED = new Set<string>(RESERVED_SLUGS.map((slug) => slug.toLowerCase()));

type SlugParentShape = { _id?: unknown; slug?: { current?: unknown } };

function parentOf(context: SlugSourceContext): SlugParentShape {
  const parent = Array.isArray(context.parent) ? context.parent[0] : context.parent;
  return (parent ?? {}) as SlugParentShape;
}

/**
 * A slug is available when nothing else in the project already claims it.
 *
 * The Studio hands us an authenticated client, so this works whether or not the
 * machine running the Studio can reach the Content Lake from outside.
 */
export async function isSlugAvailable(
  context: SlugSourceContext,
  currentType: string,
): Promise<boolean> {
  const parent = parentOf(context);
  const candidate = String(parent.slug?.current ?? "").trim().toLowerCase();
  if (!candidate) return true;

  if (RESERVED.has(candidate)) return false;
  if (currentType === "page" && candidate === "sitemap.xml") return false;

  const client = context.getClient({ apiVersion });
  const conflicting = await client.fetch<Array<{ _id: string }>>(
    `*[
      defined(slug.current) && lower(slug.current) == $slug && _id != $id
    ][0]{ _id }`,
    { slug: candidate, id: String(parent._id ?? "") },
  );

  return !conflicting.length;
}

/** Validation message helper — keeps the two slug fields consistent. */
export async function validateUniqueSlug(
  context: SlugSourceContext,
  currentType: string,
): Promise<true | string> {
  if (await isSlugAvailable(context, currentType)) return true;
  return "This slug is already used by another page, or is reserved by the website routing.";
}

/**
 * Shared slug field definition. `type` is required so the uniqueness check can
 * compare against every other type.
 */
export function slugField(type: string, group = "content") {
  return defineField({
    name: "slug",
    type: "slug",
    title: "URL Slug",
    group,
    description:
      "The public URL. This is the ONLY thing that decides where the document lives — e.g. /sultan-muhammad-fateh-episode-85-in-urdu-subtitles/. Must be unique across all content types.",
    options: { source: "title", maxLength: 96 },
    validation: (rule) =>
      rule
        .required()
        .custom(async (context) =>
          validateUniqueSlug(context as unknown as SlugSourceContext, type),
        ),
  });
}

/** Shared SEO object so every document types its search appearance the same way. */
export function seoObjectFields() {
  return [
    defineField({
      name: "seoTitle",
      type: "string",
      title: "SEO Title",
      description: "Overrides the browser/Google title. Aim for 50–60 characters.",
      validation: (rule) => rule.max(70).warning("Titles longer than 70 characters may be truncated."),
    }),
    defineField({
      name: "seoDescription",
      type: "text",
      rows: 3,
      title: "Meta Description",
      description: "Shown under the title in search results. Aim for 120–160 characters.",
      validation: (rule) => rule.max(180).warning("Descriptions longer than 180 characters may be truncated."),
    }),
    defineField({
      name: "keywords",
      type: "array",
      title: "Keywords",
      description: "Also used by on-site search. Comma separated is fine.",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "noIndex",
      type: "boolean",
      title: "Hide from search engines",
      initialValue: false,
      description: "Page stays reachable and linked, but emits `noindex, nofollow`.",
    }),
  ];
}

export function seoObjectDefinition() {
  return defineType({
    name: "seo",
    title: "SEO",
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: seoObjectFields(),
  });
}