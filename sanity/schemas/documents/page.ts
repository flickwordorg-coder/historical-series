import { defineField, defineType } from "sanity";

import { imageField } from "../objects/media";
import { bodyField, descriptionField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";

/**
 * Page — static/legal/about content at a root-level slug:
 * `/about-us/`, `/contact-us/`, `/privacy-policy/`, `/terms-and-conditions/`,
 * `/disclaimer/`, `/dmca/`.
 *
 * These pages appear in the footer and the sitemap, so a slug in the
 * `STATIC_PAGE_SLUGS` list is treated as part of the site's chrome.
 */
export const page = defineType({
  name: "page",
  title: "Page",
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
      validation: (rule) => rule.required().min(1).max(120),
    }),
    slugField("page"),
    descriptionField(),
    bodyField(),
    defineField({
      ...imageField("image", "Header image", {
        description: "Optional wide image shown behind the page header.",
      }),
      group: "artwork",
    }),
    defineField({
      name: "hideFromNavigation",
      type: "boolean",
      title: "Hide from navigation",
      group: "content",
      initialValue: false,
      description: "Keeps the page reachable at its slug but removes it from the footer.",
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
    select: { title: "title", subtitle: "slug.current", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `/${subtitle}/` : "Page",
      media,
    }),
  },
});