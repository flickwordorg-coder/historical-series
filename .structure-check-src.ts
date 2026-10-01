import type { DocumentListBuilder, StructureResolver } from "sanity/structure";

import { STATIC_PAGE_SLUGS } from "./.structure-check-routes.ts";

/**
 * Studio structure.
 *
 * Deliberately flat and grouped by content type: editors work with documents,
 * never with URL paths. Nothing here suggests a `/series/x/season/y` hierarchy,
 * because the public site does not have one.
 */

/** Document types that get their own home in the sidebar. Everything else falls through. */
const GROUPED_TYPES = [
  "series",
  "season",
  "episode",
  "movie",
  "blogPost",
  "category",
  "page",
  "siteSettings",
];

export const structure: StructureResolver = (S) => {
  /**
   * New documents are stamped with `publishedAt` / `updatedAt` when created, so
   * an editor publishing straight from a list view never has to open the
   * document first. The timestamp is captured per list build, which keeps this
   * helper free of module-level state.
   */
  const stampedTemplate = (schemaType: string) => {
    const now = new Date().toISOString();
    return {
      id: "stamped",
      type: "initialValueTemplateItem" as const,
      templateId: "stamped",
      schemaType,
      title: "New (timestamped)",
      value: { publishedAt: now, updatedAt: now },
    };
  };

  /**
   * Watch/editorial lists default to newest-updated first, with stamped new
   * documents.
   *
   * `filter` is mandatory — Sanity throws `SerializeError` without it, so this
   * mirrors what `S.documentTypeList()` sets internally. Matching its exact
   * `_type == $type` + single `$type` param shape also keeps the sidebar
   * document-count badge, which Sanity withholds from any narrower list.
   */
  const byRecentFirst = (schemaType: string) =>
    S.documentList()
      .title(schemaType)
      .schemaType(schemaType)
      .filter("_type == $type")
      .params({ type: schemaType })
      .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
      .initialValueTemplates(stampedTemplate(schemaType));

  const watch = S.list()
    .title("Watch")
    .items([
      S.listItem().title("Series").child(byRecentFirst("series")),
      S.listItem().title("Seasons").child(byRecentFirst("season")),
      S.listItem().title("Episodes").child(byRecentFirst("episode")),
      S.listItem().title("Movies").child(byRecentFirst("movie")),
    ]);

  const editorial = S.list()
    .title("Editorial")
    .items([
      S.listItem().title("Blog Posts").child(byRecentFirst("blogPost")),
      S.listItem()
        .title("Categories")
        .child(S.documentTypeList("category").title("Categories")),
    ]);

  const sitePages: DocumentListBuilder = S.documentList()
    .title("Site Pages")
    .schemaType("page")
    .filter('_type == "page" && slug.current in $slugs')
    .params({ slugs: [...STATIC_PAGE_SLUGS] })
    .defaultOrdering([{ field: "title", direction: "asc" }])
    .initialValueTemplates(stampedTemplate("page"));

  const otherPages: DocumentListBuilder = S.documentList()
    .title("Other Pages")
    .schemaType("page")
    .filter('_type == "page" && !(slug.current in $slugs)')
    .params({ slugs: [...STATIC_PAGE_SLUGS] })
    .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
    .initialValueTemplates(stampedTemplate("page"));

  const website = S.list()
    .title("Website")
    .items([
      S.listItem().title("Site Pages").child(sitePages),
      S.listItem().title("Other Pages").child(otherPages),
      S.divider(),
      S.documentTypeListItem("siteSettings").title("Site Settings"),
    ]);

  const strays = S.documentTypeListItems().filter((item) => {
    const id = item.getId();
    return typeof id === "string" && !GROUPED_TYPES.includes(id);
  });

  return S.list()
    .title("Content")
    .items([
      S.listItem().title("Watch").child(watch),
      S.listItem().title("Editorial").child(editorial),
      S.listItem().title("Website").child(website),
      ...(strays.length ? [S.divider(), ...strays] : []),
    ]);
};

export default structure;
