import { defineField, defineType } from "sanity";

import { bannerField, logoField, posterField } from "../objects/media";
import { descriptionField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";
import { videoSourceFields } from "../objects/videoSource";

/**
 * Movie — published at a root-level slug (`/tomris/`).
 * There is no `/movies/` prefix; the movie index lives at `/turkish-movies/`.
 */
export const movie = defineType({
  name: "movie",
  title: "Movie",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "video", title: "Video" },
    { name: "artwork", title: "Artwork" },
    { name: "facts", title: "Facts" },
    { name: "seo", title: "SEO" },
    { name: "publishing", title: "Publishing" },
  ],
  orderings: [
    { title: "Newest first", name: "publishedDesc", by: [{ field: "releaseYear", direction: "desc" }] },
    { title: "Title", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      group: "content",
      validation: (rule) => rule.required().min(1).max(140),
    }),
    slugField("movie"),
    descriptionField(),
    ...videoSourceFields(),
    defineField({ ...logoField(), group: "artwork" }),
    defineField({ ...posterField(), group: "artwork" }),
    defineField({ ...bannerField(), group: "artwork" }),
    defineField({
      name: "language",
      type: "string",
      title: "Language",
      group: "facts",
      initialValue: "Turkish",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "country",
      type: "string",
      title: "Country",
      group: "facts",
      options: { list: ["Turkey", "Pakistan", "India", "Other"] },
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "releaseYear",
      type: "number",
      title: "Release year",
      group: "facts",
      validation: (rule) => rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: "genres",
      type: "array",
      title: "Genres",
      group: "facts",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      validation: (rule) => rule.unique(),
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
    select: { title: "title", subtitle: "releaseYear", media: "poster" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `Movie · ${subtitle}` : "Movie",
      media,
    }),
  },
});