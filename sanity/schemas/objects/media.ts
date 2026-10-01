import { defineField } from "sanity";
import type { ImageRule, StringRule } from "@sanity/types";

/**
 * Image field factories.
 *
 * They return plain field definitions so a document can place them in its own
 * `group` without re-declaring anything:
 *
 *   defineField({ ...posterField(), group: "artwork" })
 *
 * `next/image` renders every Sanity asset, so alt text is enforced here rather
 * than being discovered later as an accessibility bug.
 */

export interface ImageFieldOptions {
  hotspot?: boolean;
  required?: boolean;
  description?: string;
}

function buildImageField(
  name: string,
  title: string,
  options: ImageFieldOptions = {},
) {
  const isRequired = options.required === true;

  return defineField({
    name,
    title,
    type: "image" as const,
    options: { hotspot: options.hotspot ?? true },
    ...(options.description ? { description: options.description } : {}),
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alternative text",
        description: "Required. Describe the image for people using a screen reader.",
        validation: (rule: StringRule) =>
          isRequired ? rule.required().min(3) : rule.min(3).warning("Add alternative text."),
      }),
      defineField({ name: "caption", type: "string", title: "Caption" }),
    ],
    validation: (rule: ImageRule) => (isRequired ? rule.required() : rule),
  });
}

/** 2:3 portrait artwork — series, seasons, movies, categories. */
export const posterField = () =>
  buildImageField("poster", "Poster", {
    required: true,
    description: "Portrait 2:3 artwork used on cards and in the hero.",
  });

/** 16:9 landscape artwork used behind heroes. */
export const bannerField = () =>
  buildImageField("banner", "Banner", {
    description: "Wide 16:9 artwork used behind the hero and on rails.",
  });

/** Transparent title art. */
export const logoField = () =>
  buildImageField("logo", "Logo / Title Art", {
    hotspot: false,
    description: "Optional transparent title treatment shown over the hero.",
  });

/** Generic named image (thumbnail, featured image, category image). */
export const imageField = (name: string, title: string, options: ImageFieldOptions = {}) =>
  buildImageField(name, title, options);