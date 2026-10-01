import { defineField, defineType } from "sanity";

import { imageField } from "../objects/media";
import { descriptionField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";

/**
 * Category — a taxonomy page at a root-level slug (`/kizil-elma/`).
 *
 * Membership is computed by the shared GROQ matcher (`CATEGORY_MATCH`):
 *  - blog posts that reference this category
 *  - series / seasons / movies / episodes whose genres match the category title
 *  - everything belonging to the linked series (when `series` is set)
 *
 * The optional `series` reference is what makes a category behave like a series
 * hub ("Sultan Muhammad Fateh" showing all 86 episodes) without inventing a
 * second hierarchy in the URL.
 */
export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "artwork", title: "Artwork" },
    { name: "seo", title: "SEO" },
  ],
  orderings: [{ title: "Title", name: "titleAsc", by: [{ field: "title", direction: "asc" }] }],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      group: "content",
      validation: (rule) => rule.required().min(1).max(120),
    }),
    slugField("category"),
    defineField({
      name: "series",
      type: "reference",
      title: "Linked series",
      group: "content",
      to: [{ type: "series" }],
      description:
        "Optional. When set, this category also lists that series and all of its episodes.",
    }),
    descriptionField(),
    defineField({
      ...imageField("image", "Category image", {
        description: "Wide artwork used on the category hero and grid card.",
      }),
      group: "artwork",
    }),
    defineField({
      name: "seo",
      type: "object",
      title: "SEO",
      group: "seo",
      options: { collapsible: true, collapsed: true },
      fields: seoObjectFields(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "series.title", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `Category · ${subtitle}` : "Category",
      media,
    }),
  },
});