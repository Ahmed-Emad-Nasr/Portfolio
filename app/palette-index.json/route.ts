/*
 * /palette-index.json — what the command palette searches: every case and
 * every published post (id, title, category). A static file fetched the
 * first time the palette opens, instead of being serialised into the HTML of
 * every page (it was ~10 KB on each one).
 */

import { caseIndex } from "@/app/core/config/library-data";
import { getAllPosts } from "@/app/core/content/posts";

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts()
    .filter((p) => !p.draft)
    .map((p) => ({ id: p.slug, title: p.title, category: "Post" }));
  return Response.json([...posts, ...caseIndex]);
}
