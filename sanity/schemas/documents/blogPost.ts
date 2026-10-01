import { defineField, defineType } from "sanity";

import { imageField } from "../objects/media";
import { bodyField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";

/**
 * BlogPost — published at a root-level slug (`/history-of-mughal/`).
 * There is deliberately no `/blog/` prefix on articles; `/blog/` is only the
 * index page. This mirrors how the reference product (and WordPress sites in
 * general) index long-form history content.
 */
export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "artwork", title: "Artwork" },
    { name: "taxonomy", title: "Categories & Tags" },
    { name: "seo", title: "SEO" },
    { name: "publishing", title: "Publishing" },
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    { title: "Title", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      group: "content",
      validation: (rule) => rule.required().min(3).max(160),
    }),
    slugField("blogPost"),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      title: "Excerpt",
      group: "content",
      description: "Short summary. Used on cards and as the meta description fallback.",
      validation: (rule) => rule.required().min(40).max(320),
    }),
    bodyField(),
    defineField({
      ...imageField("featuredImage", "Featured image", {
        required: true,
        description: "16:9 hero image for the article.",
      }),
      group: "artwork",
    }),
    defineField({
      name: "author",
      type: "string",
      title: "Author",
      group: "content",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "categories",
      type: "array",
      title: "Categories",
      group: "taxonomy",
      description: "Links the article to a category page.",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      group: "taxonomy",
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
      description: "Takes precedence over Published at for the sitemap's lastModified.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "featuredImage" },
  },
});