import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

const stampedTemplateTypes = ["series", "season", "episode", "movie", "blogPost", "page"] as const;

/**
 * Studio configuration.
 *
 * Shared by the standalone `npm run studio` server and the optional embedded
 * Studio route, so there is exactly one schema definition.
 */
export default defineConfig({
  name: "historical-series",
  title: "Historical Series",
  projectId,
  dataset,
  basePath: "/studio",
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      ...stampedTemplateTypes.map((schemaType) => ({
        id: `stamped-${schemaType}`,
        title: "New (timestamped)",
        schemaType,
        value: () => {
          const now = new Date().toISOString();
          return { publishedAt: now, updatedAt: now };
        },
      })),
    ],
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Keeps production honest: the published site only reads these perspectives.
    actions: (prev, context) =>
      context.schemaType === "siteSettings"
        ? prev.filter((action) => action.action !== "delete")
        : prev,
  },
});