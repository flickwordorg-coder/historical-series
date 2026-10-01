import { defineField } from "sanity";

/**
 * Video source object shared by Episode and Movie.
 *
 * The public site renders whatever URL is stored here through the single
 * `<VideoPlayer>` component, which validates the host against
 * `lib/video/providers.ts`. Nothing about a video is hard-coded in the UI.
 *
 * Only embed sources that the provider permits to be embedded and that the site
 * owner is licensed to distribute.
 */
export function videoSourceFields(group = "video") {
  return [
    defineField({
      name: "embedUrl",
      type: "url",
      title: "Embed URL",
      group,
      description:
        "The provider's embed URL (HTTPS only), e.g. https://play.niazitv.pk/play?data=NzMy",
      validation: (rule) =>
        rule.required().uri({ scheme: ["https"] }).error("Video must use an HTTPS embed URL."),
    }),
    defineField({
      name: "videoType",
      type: "string",
      title: "Player type",
      group,
      initialValue: "embed",
      options: {
        layout: "radio",
        list: [
          { title: "Embed (iframe)", value: "embed" },
          { title: "External link", value: "external" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      type: "number",
      title: "Duration (seconds)",
      group,
      description: "Optional. Only used when you know the real runtime — never guessed.",
      validation: (rule) => rule.integer().positive().max(6 * 60 * 60),
    }),
  ];
}