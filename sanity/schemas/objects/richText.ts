import { defineField, defineType, type PortableTextBlock } from "sanity";

/**
 * Portable Text limited to what a history / streaming article actually needs.
 * A constrained schema keeps the public `Prose` renderer small and predictable.
 */
export const richText = defineType({
  name: "richText",
  title: "Rich Text",
  type: "array",
  of: [
    {
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Underline", value: "underline" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) =>
                  rule.required().uri({ scheme: ["http", "https", "mailto", "tel"] }),
              }),
              defineField({
                name: "blank",
                type: "boolean",
                title: "Open in new tab",
                initialValue: true,
              }),
            ],
          },
        ],
      },
    },
    {
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          description:
            "Describe the image for screen readers. Leave empty only when the image is purely decorative.",
          validation: (rule) => rule.max(160),
        }),
        defineField({ name: "caption", type: "string", title: "Caption" }),
      ],
    },
  ],
});

/** Plain-text length of a Portable Text value — used for SEO guidance only. */
export function portableTextLength(value: unknown): number {
  if (!Array.isArray(value)) return 0;
  return value.reduce<number>((total, block) => {
    const children = (block as PortableTextBlock | undefined)?.children;
    if (!Array.isArray(children)) return total;
    return (
      total + children.reduce((sum, child) => sum + (typeof child.text === "string" ? child.text.length : 0), 0)
    );
  }, 0);
}

/**
 * Description field shared by Series / Season / Episode / Movie / Category /
 * Page. Also feeds the meta description when no SEO override is set, so the
 * editor gets told about short copy instead of discovering it in Search Console.
 */
export function descriptionField(group = "content") {
  return defineField({
    name: "description",
    type: "richText",
    title: "Description",
    group,
    description:
      "Shown on the page and used for the meta description when no SEO override is set.",
    validation: (rule) =>
      rule.custom((value) => {
        const length = portableTextLength(value);
        if (length === 0) return true;
        return length >= 80
          ? true
          : "Add a little more detail (80+ characters) so search engines and readers get real context.";
      }),
  });
}

export function bodyField(group = "content") {
  return defineField({
    name: "body",
    type: "richText",
    title: "Body",
    group,
    validation: (rule) => rule.required().min(1),
  });
}