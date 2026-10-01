import { defineField, defineType } from "sanity";

import { bannerField, logoField, posterField } from "../objects/media";
import { descriptionField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";

/**
 * Series — the top-level content type.
 *
 * The slug IS the public URL (`/kurulus-osman/`). Seasons and Episodes hang off
 * this document through references; that hierarchy is never exposed in a URL.
 */
export const series = defineType({
  name: "series",
  title: "Series",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "facts", title: "Facts" },
    { name: "artwork", title: "Artwork" },
    { name: "seo", title: "SEO" },
    { name: "publishing", title: "Publishing" },
  ],
  orderings: [
    { title: "Title", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
    {
      title: "Newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      group: "content",
      validation: (rule) => rule.required().min(1).max(120),
    }),
    slugField("series"),
    descriptionField(),
    defineField({ ...logoField(), group: "artwork" }),
    defineField({ ...posterField(), group: "artwork" }),
    defineField({ ...bannerField(), group: "artwork" }),
    defineField({
      name: "country",
      type: "string",
      title: "Country",
      group: "facts",
      options: { list: ["Turkey", "Pakistan", "India", "Other"] },
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "language",
      type: "string",
      title: "Original language",
      group: "facts",
      initialValue: "Turkish",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "genres",
      type: "array",
      title: "Genres",
      group: "facts",
      description: "Shared with other series; powers the Related Series section.",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      group: "facts",
      options: { list: ["Ongoing", "Ended", "Coming Soon", "Hiatus"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "releaseYear",
      type: "number",
      title: "First aired",
      group: "facts",
      validation: (rule) => rule.integer().min(1950).max(2100),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Featured on homepage",
      group: "facts",
      initialValue: false,
      description: "Appears in the Featured Series rail and is preferred as the homepage hero.",
    }),
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
      description: "Used for the sitemap's lastModified and for 'latest' ordering.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      type: "datetime",
      title: "Updated at",
      group: "publishing",
      initialValue: () => new Date().toISOString(),
      description: "Takes precedence over Published at for the sitemap's lastModified.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "poster" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `Series · ${subtitle}` : "Series",
      media,
    }),
  },
});