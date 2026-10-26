/*
 * core/content/posts.ts — the blog's written posts (SERVER-ONLY: build time).
 *
 * A post is one MDX file in content/posts/ (repo root). The file name is the
 * URL: content/posts/wazuh-rule-tuning.mdx → /blog/wazuh-rule-tuning — the
 * same URL space as the case pages, so a slug must not reuse a case id
 * (checked below; the build fails with the clashing name).
 *
 * Front matter:
 *
 *   ---
 *   title: "Tuning Wazuh rules without drowning in alerts"
 *   description: "One sentence for the card, search results and the share card."
 *   date: 2026-10-20            # publication date (YYYY-MM-DD)
 *   updated: 2026-10-24         # optional
 *   tags: [Wazuh, Detection Engineering, SOC]
 *   lang: en                    # en | ar — ar sets dir="rtl" and the Arabic font
 *   series: "Wazuh from zero"   # optional: posts with the same series are linked in order
 *   seriesPart: 2               # optional, the order inside the series
 *   cover: Assets/blog/wazuh.webp  # optional, under public/ — also the share image
 *   draft: true                 # optional: shown by `npm run dev` only, never built
 *   ---
 *
 * Everything else is Markdown (GitHub flavour: tables, task lists,
 * footnotes) plus the components in app/blog/posts/mdx-components.tsx.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { caseEvidenceLibrary } from "@/app/core/config/cases";

type PostLang = "en" | "ar";

export type PostHeading = { depth: 2 | 3; text: string; id: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  lang: PostLang;
  series?: string;
  seriesPart?: number;
  cover?: string;
  draft: boolean;
  readTime: number;
  headings: PostHeading[];
};

export type Post = PostMeta & { source: string };

const POSTS_DIR = join(process.cwd(), "content", "posts");

/* Drafts appear while writing (next dev), never in the exported site */
const SHOW_DRAFTS = process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "1";

const isoDate = (value: unknown, file: string, field: string): string => {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) throw new Error(`content/posts/${file}: "${field}" is not a date (use YYYY-MM-DD)`);
  return d.toISOString().slice(0, 10);
};

/* Headings for the table of contents. github-slugger is what rehype-slug
   uses, so these ids match the ones in the rendered page. Fenced code is
   skipped — a "## " inside a shell snippet is not a heading. */
function extractHeadings(source: string): PostHeading[] {
  const slugger = new GithubSlugger();
  const out: PostHeading[] = [];
  let fenced = false;
  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_]/g, "");
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}

/* ~200 words a minute for technical reading; code counts as words too */
const readingTime = (source: string): number =>
  Math.max(1, Math.round(source.split(/\s+/).filter(Boolean).length / 200));

function parse(file: string): Post {
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx?$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`content/posts/${file}: file names must be lowercase-with-dashes (it becomes the URL)`);
  }
  if (!data.title || !data.description || !data.date) {
    throw new Error(`content/posts/${file}: front matter needs title, description and date`);
  }
  const lang: PostLang = data.lang === "ar" ? "ar" : "en";
  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    date: isoDate(data.date, file, "date"),
    ...(data.updated ? { updated: isoDate(data.updated, file, "updated") } : {}),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    lang,
    ...(data.series ? { series: String(data.series) } : {}),
    ...(data.seriesPart !== undefined ? { seriesPart: Number(data.seriesPart) } : {}),
    ...(data.cover ? { cover: String(data.cover).replace(/^\/+/, "") } : {}),
    draft: data.draft === true,
    readTime: readingTime(content),
    headings: extractHeadings(content),
    source: content,
  };
}

let cache: Post[] | null = null;

function loadAll(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = existsSync(POSTS_DIR) ? readdirSync(POSTS_DIR).filter((f) => /\.mdx?$/.test(f)) : [];
  const posts = files
    .map(parse)
    .filter((p) => SHOW_DRAFTS || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

  const caseIds = new Set(caseEvidenceLibrary.map((c) => c.id));
  const clash = posts.find((p) => caseIds.has(p.slug));
  if (clash) {
    throw new Error(`content/posts/${clash.slug}.mdx: "${clash.slug}" is already a case id — /blog/${clash.slug} would be both. Rename the file.`);
  }
  cache = posts;
  return posts;
}

const meta = ({ source: _source, ...rest }: Post): PostMeta => rest;

/** Every published post (drafts too under `next dev`), newest first, without the body */
export function getAllPosts(): PostMeta[] {
  return loadAll().map(meta);
}

/** One post with its MDX body, or undefined */
export function getPost(slug: string): Post | undefined {
  return loadAll().find((p) => p.slug === slug);
}

/** Tag → posts, tags sorted by how many posts use them */
export function getTags(): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of loadAll()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** "Detection Engineering" → "detection-engineering" (the /blog/tag/<slug> URL) */
export function tagSlug(tag: string): string {
  return new GithubSlugger().slug(tag);
}

/** The posts around this one: previous/next by date, the series in order, related by shared tags */
export function getPostNeighbours(slug: string) {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  const post = all[i];
  const newer = i > 0 ? all[i - 1] : null;
  const older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  const series = post?.series
    ? all.filter((p) => p.series === post.series).sort((a, b) => (a.seriesPart ?? 0) - (b.seriesPart ?? 0) || a.date.localeCompare(b.date))
    : [];
  const tags = new Set(post?.tags ?? []);
  const related = all
    .filter((p) => p.slug !== slug && !(post?.series && p.series === post.series))
    .map((p) => ({ p, score: p.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, 3)
    .map((x) => x.p);
  return { newer, older, series, related };
}
