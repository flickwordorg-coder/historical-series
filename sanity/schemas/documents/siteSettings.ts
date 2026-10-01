import { defineField, defineType } from "sanity";

import { imageField } from "../objects/media";

/**
 * SiteSettings — a singleton holding the pieces of homepage SEO content that
 * editors should not have to deploy to change.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "seo", title: "Homepage SEO" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      type: "string",
      title: "Site title",
      group: "identity",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "siteDescription",
      type: "text",
      rows: 2,
      title: "Site description",
      group: "identity",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      ...imageField("defaultOgImage", "Default social share image", {
        description: "1200×630 image used when a page has no artwork of its own.",
      }),
      group: "seo",
    }),
    defineField({
      name: "homepageSeoTitle",
      type: "string",
      title: "Homepage SEO title",
      group: "seo",
      validation: (rule) => rule.max(70).warning("Titles over 70 characters may be truncated."),
    }),
    defineField({
      name: "homepageSeoDescription",
      type: "text",
      rows: 3,
      title: "Homepage meta description",
      group: "seo",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "homepageSeoContent",
      type: "richText",
      title: "Homepage editorial content",
      group: "seo",
      description:
        "The long-form copy block rendered near the bottom of the homepage. Use it for genuine, useful information — not keyword stuffing.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings", subtitle: "Singleton — one document only" }),
  },
});