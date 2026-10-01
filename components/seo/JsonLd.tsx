/**
 * JSON-LD serialiser — the ONLY place in the app that emits a
 * `<script type="application/ld+json">` tag.
 *
 * `<` is escaped so no CMS value can ever break out of the script element.
 */
export function JsonLd({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null;

  const payload = Array.isArray(data) ? data.filter(Boolean) : [data];
  if (payload.length === 0) return null;

  const graph = payload.length === 1 ? payload[0] : { "@context": "https://schema.org", "@graph": payload };
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Emits several builders as one `@graph` document. */
export function JsonLdSet({ nodes }: { nodes: ReadonlyArray<unknown> }) {
  return <JsonLd data={nodes.filter(Boolean)} />;
}