/*
 * lib/routes.ts — which page each section lives on.
 *
 *   /       the portfolio: pitch, about, gallery, FAQ, contact
 *   /blog   the evidence: start here, the case
 *           library, videos, ATT&CK coverage, detection rules, triage
 *
 * Everything that links to a section by id (nav, command palette,
 * g-shortcuts, the stats bar, filter links) asks this file where it is.
 * Old links to the blog's sections on the home page (/#cases,
 * /?q=wazuh#cases, /#case-…, /#attack …) are forwarded by
 * homeForwardScript() before the home page paints.
 */

type SitePage = "/" | "/blog";

/** Section ids that live on /blog (plus every #case-… and #tactic-… anchor) */
const BLOG_IDS = new Set(["start-here", "cases", "videos", "youtube", "attack", "detections", "triage"]);
const BLOG_PREFIX = /^(case|tactic)-/;

/** Search params that belong to the case library's filters */
export const LIBRARY_PARAMS = ["q", "cat", "tools", "kind", "sort", "view"] as const;

/** The page a section id lives on */
export function pageOf(id: string): SitePage {
  return BLOG_IDS.has(id) || BLOG_PREFIX.test(id) ? "/blog" : "/";
}

/**
 * Inline script for the home page: an old link to one of the blog's
 * sections (shared on LinkedIn, in a CV, in search results — from before
 * the blog had its own page) opens /blog with the same filters and anchor.
 * Runs before paint, so the home page never flashes first. `base` is the
 * deploy prefix ("/Portfolio" in production).
 */
export function homeForwardScript(base: string): string {
  const ids = JSON.stringify([...BLOG_IDS]);
  const params = JSON.stringify(LIBRARY_PARAMS);
  return `(function(){try{var h=location.hash.slice(1),s=location.search,b=${ids}.indexOf(h)>-1||/^(case|tactic)-/.test(h);
if(!b&&s){var q=new URLSearchParams(s),k=${params};for(var i=0;i<k.length;i++)if(q.has(k[i])){b=true;break}}
if(b)location.replace(${JSON.stringify(base)}+"/blog"+s+location.hash);}catch(e){}})();`;
}
