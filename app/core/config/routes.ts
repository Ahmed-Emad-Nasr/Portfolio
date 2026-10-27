/*
 * core/config/routes.ts — which page each section lives on.
 *
 * The site used to be one 44,000px page (26 sections, the blog starting
 * ~40 screens down). It is now four:
 *
 *   /         the pitch: who, what, proof, experience, credentials, contact
 *   /blog     the writing: posts, the case library, ATT&CK coverage,
 *             detection rules, the triage challenge, videos
 *   /about    the depth: toolbox, daily drivers, home lab, path, process,
 *             practice profiles, contributions
 *   /gallery  the proof gallery: certificates, events, moments
 *
 * Everything that links to a section (nav, command palette, g-shortcuts,
 * the stats bar, filter links) asks this file where the section is, so a
 * section can move again by changing one line here. Old links to the home
 * page (/#cases, /?q=wazuh#cases, /#case-…) are forwarded by
 * homeForwardScript() below.
 */

import { normalizePublicHref } from "./shared";

type SitePage = "/" | "/blog" | "/about" | "/gallery";

/** Sections that are not on the home page, by element id */
const SECTION_PAGE: Record<string, SitePage> = {
  posts: "/blog",
  "start-here": "/blog",
  cases: "/blog",
  videos: "/blog",
  youtube: "/blog",
  attack: "/blog",
  detections: "/blog",
  triage: "/blog",
  stack: "/about",
  uses: "/about",
  lab: "/about",
  path: "/about",
  now: "/about",
  process: "/about",
  contributions: "/about",
  art: "/gallery",
};

/** The page a section id lives on ("/" for everything on the home page) */
export function pageOfSection(id: string): SitePage {
  if (SECTION_PAGE[id]) return SECTION_PAGE[id];
  if (/^(case|tactic)-/.test(id)) return "/blog";
  return "/";
}

/** Search params that belong to the case library's filters */
const LIBRARY_PARAMS = ["q", "cat", "tools", "kind", "sort", "view"] as const;

/**
 * Inline script for the home page: forwards links made before the split
 * (shared on LinkedIn, in a CV, in search results) to the page the section
 * now lives on, keeping the filters and the anchor. Runs before paint, so
 * nobody sees the home page flash first. `base` is the deploy prefix
 * ("/Portfolio" in production).
 */
export function homeForwardScript(base: string): string {
  const map = JSON.stringify(SECTION_PAGE);
  const params = JSON.stringify(LIBRARY_PARAMS);
  return `(function(){try{var m=${map},h=location.hash.slice(1),s=location.search,p=m[h]||(/^(case|tactic)-/.test(h)?"/blog":null);
if(!p&&s){var q=new URLSearchParams(s),k=${params};for(var i=0;i<k.length;i++)if(q.has(k[i])){p="/blog";break}}
if(p)location.replace(${JSON.stringify(base)}+p+s+location.hash);}catch(e){}})();`;
}

/**
 * Inline script for the other pages: a link to a section that has since
 * moved off this page (/about#art, from before the gallery got its own
 * page) opens the page it lives on now.
 */
export function hashForwardScript(base: string, here: SitePage): string {
  const map = JSON.stringify(SECTION_PAGE);
  return `(function(){try{var p=${map}[location.hash.slice(1)];if(p&&p!==${JSON.stringify(here)})location.replace(${JSON.stringify(base)}+p+location.hash);}catch(e){}})();`;
}

/**
 * The link to a section for a plain <a>: a section on the page you are on
 * stays a bare "#id" (no reload), anything else gets its page and the deploy
 * prefix ("/Portfolio/blog#cases"). For next/link use
 * `${pageOfSection(id)}#${id}` — next/link adds the prefix itself.
 */
export function sectionAnchor(id: string, from: SitePage = "/"): string {
  const page = pageOfSection(id);
  if (page === from) return `#${id}`;
  return `${normalizePublicHref(page)}#${id}`;
}
