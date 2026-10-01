import { defineField, defineType } from "sanity";

import { bannerField, posterField } from "../objects/media";
import { descriptionField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";

/**
 * Season — sits between Series and Episode in Sanity.
 *
 * A season has NO public URL by default. Fill in the slug only when you want a
 * dedicated landing page (e.g. `/sultan-muhammad-fateh-season-4/`). Individual
 * episodes always stay at the root level regardless.
 */
export const season = defineType({
  name: "season",
  title: "Season",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "artwork", title: "Artwork" },
    { name: "seo", title: "SEO" },
    { name: "publishing", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      group: "content",
      description: 'e.g. "Season 4" — the number below controls the ordering.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "series",
      type: "reference",
      title: "Series",
      group: "content",
      to: [{ type: "series" }],
      description: "The parent series. Drives the season switcher and episode grouping.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seasonNumber",
      type: "number",
      title: "Season number",
      group: "content",
      description: "Used for ordering — never parsed from the slug.",
      validation: (rule) => rule.required().integer().min(1).max(100),
    }),
    slugField("season"),
    descriptionField(),
    defineField({ ...posterField(), group: "artwork" }),
    defineField({ ...bannerField(), group: "artwork" }),
    defineField({
      name: "seo",
      type: "object",
      title: "SEO",
      group: "seo",
      options: { collapsible: true, collapsed: true },
      fields: seoObjectFields(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Published at",
      group: "publishing",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      type: "datetime",
      title: "Updated at",
      group: "publishing",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      seriesTitle: "series.title",
      media: "poster",
      seasonNumber: "seasonNumber",
    },
    prepare: ({ title, seriesTitle, media, seasonNumber }) => ({
      title: `${seasonNumber ? `S${seasonNumber} · ` : ""}${title}`,
      subtitle: seriesTitle ?? "Unlinked season",
      media,
    }),
  },
});