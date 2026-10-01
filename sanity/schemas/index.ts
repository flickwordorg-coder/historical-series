import type { SchemaTypeDefinition } from "sanity";

import { blogPost } from "./documents/blogPost";
import { category } from "./documents/category";
import { episode } from "./documents/episode";
import { movie } from "./documents/movie";
import { page } from "./documents/page";
import { season } from "./documents/season";
import { series } from "./documents/series";
import { siteSettings } from "./documents/siteSettings";
import { richText } from "./objects/richText";

/**
 * Schema registry — the single list the Studio and any migration script read.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents (these own public URLs)
  series,
  season,
  episode,
  movie,
  blogPost,
  category,
  page,
  siteSettings,

  // Objects
  richText,
];

export {
  blogPost,
  category,
  episode,
  movie,
  page,
  season,
  series,
  siteSettings,
};