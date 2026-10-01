import { defineField, defineType } from "sanity";

import { imageField } from "../objects/media";
import { descriptionField } from "../objects/richText";
import { seoObjectFields, slugField } from "../objects/seo";
import { videoSourceFields } from "../objects/videoSource";

/**
 * Episode — the most numerous document type, and the one that defines the URL
 * shape the whole site is judged on:
 *
 *   /sultan-muhammad-fateh-episode-85-in-urdu-subtitles/
 *
 * Series and Season references create the relationship for ordering and
 * navigation. Neither appears in the URL.
 */
export const episode = defineType({
  name: "episode",
  title: "Episode",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "video", title: "Video" },
    { name: "artwork", title: "Artwork" },
    { name: "seo", title: "SEO" },
    { name: "publishing", title: "Publishing" },
  ],
  orderings: [
    {
      title: "Series, then episode number",
      name: "episodeAsc",
      by: [
        { field: "series.title", direction: "asc" },
        { field: "seasonNumber", direction: "asc" },
        { field: "episodeNumber", direction: "asc" },
      ],
    },
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
      description:
        'e.g. "Episode 85 with Urdu Subtitles" — the H1 is rendered from this.',
      validation: (rule) => rule.required().min(1).max(160),
    }),
    slugField("episode"),
    defineField({
      name: "series",
      type: "reference",
      title: "Series",
      group: "content",
      to: [{ type: "series" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "season",
      type: "reference",
      title: "Season",
      group: "content",
      to: [{ type: "season" }],
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          const seasonId = (value as { _ref?: string } | undefined)?._ref;
          if (!seasonId) return true;

          const parent = await context.getClient({
            apiVersion: process.env.SANITY_API_VERSION ?? "2026-09-30",
          }).fetch<{ series?: { _ref: string } }>(
            `*[_id == $id][0]{ "series": series->{ _ref } }`,
            { id: seasonId },
          );

          const parentSeriesRef = parent?.series?._ref;
          const seriesRef = (context.document as { series?: { _ref?: string } } | undefined)?.series
            ?._ref;

          // Only enforce when the editor has already picked a series — otherwise
          // the season's own series is used by `syncSeriesNumber`.
          if (!seriesRef || !parentSeriesRef) return true;
          return seriesRef === parentSeriesRef
            ? true
            : "This season belongs to a different series. Pick the season that matches the selected series.";
        }),
    }),
    defineField({
      name: "episodeNumber",
      type: "number",
      title: "Episode number",
      group: "content",
      description: "Numeric ordering + previous/next navigation. Never derived from the slug.",
      validation: (rule) => rule.required().integer().min(0).max(100000),
    }),
    defineField({
      name: "seasonNumber",
      type: "number",
      title: "Season number",
      group: "content",
      description: "Mirrors the parent season so the episode list never needs a join.",
      validation: (rule) => rule.required().integer().min(1).max(100),
    }),
    descriptionField(),
    ...videoSourceFields(),
    defineField({
      ...imageField("thumbnail", "Thumbnail", {
        required: true,
        description: "16:9 still used on cards, rails and as the video poster.",
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
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Published at",
      group: "publishing",
      description: "Publication date. Drives the 'latest episodes' ordering.",
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
    select: {
      title: "title",
      seriesTitle: "series.title",
      episodeNumber: "episodeNumber",
      media: "thumbnail",
    },
    prepare: ({ title, seriesTitle, episodeNumber, media }) => ({
      title: episodeNumber ? `E${episodeNumber} · ${title}` : title,
      subtitle: seriesTitle ?? "Unlinked episode",
      media,
    }),
  },
});