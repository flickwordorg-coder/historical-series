import { createClient } from "@sanity/client";

import { readFileSync, writeFileSync } from "node:fs";

/**
 * Throwaway harness: runs the real structure resolver through Sanity's own
 * serializer with a stub context, so a `SerializeError` surfaces here instead
 * of in the browser console.
 *
 * `structure.ts` is copied with its extensionless import rewritten because
 * Node's ESM resolver does not do bundler-style resolution.
 */
const source = readFileSync("sanity/structure.ts", "utf8").replace(
  'from "../lib/site/routes"',
  'from "./.structure-check-routes.ts"',
);
writeFileSync(".structure-check-src.ts", source);

const { structure } = (await import("./.structure-check-src.ts")) as {
  structure: (S: never) => { serialize: () => unknown };
};

const stubType = (name: string) => ({ name, title: name, type: "document", fields: [] });

const context = {
  schema: { get: (name: string) => stubType(name), getTypeNames: () => [] },
  getClient: () =>
    createClient({ projectId: "t8e0pyrg", dataset: "production", apiVersion: "2026-09-30" }),
  resolveDocumentNode: () => {
    throw new Error("not called during serialize()");
  },
  templates: { find: () => undefined, filter: () => [] },
};

const { n: createStructureBuilder } = (await import(
  new URL("./node_modules/sanity/lib/StructureToolProvider-dt7M6N3r.js", import.meta.url).href
)) as { n: (ctx: unknown) => never };

const serialized = structure(createStructureBuilder(context)).serialize();

const walk = (node: any, path: string[]): void => {
  if (node.type === "documentList") {
    console.log(
      `  ${path.join(" > ")}  filter=${JSON.stringify(node.options?.filter)}  params=${JSON.stringify(node.options?.params)}`,
    );
  }
  for (const item of node.items ?? []) {
    if (item.child?.type) walk(item.child, [...path, item.title ?? item.id]);
    else if (item.type === "list" || item.type === "folder") walk(item, [...path, item.title]);
  }
};

console.log("serialize() OK — document lists:");
walk(serialized, []);
