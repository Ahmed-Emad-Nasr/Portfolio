/*
 * core/config/library-data.ts
 *
 * The case library as the home page shows it, computed once at build time
 * (the ordering, the search index, the filter facets, the counts). Imported
 * only by the server page, which hands the results to the client section —
 * so none of this computation ships to the browser.
 */

import { caseEvidenceLibrary, caseScreenshotsByEvidenceId, investigationReportCount } from "./cases";
import type { PdfResource } from "./shared";
import { SITE_BASE_URL, caseUrl } from "./site";
import { ATTACK_TACTICS, buildCoverage, caseAttackMapping, coveredTechniqueCount } from "./attack";

export type Facet = { value: string; count: number };

/* What a card shows of its screenshots: the cover and the count. The full
   lists are served once as /case-screenshots.json and fetched only when a
   gallery is opened, instead of riding along in the home page's HTML. */
export type CaseMedia = { cover?: string; count: number };
export const mediaById: Record<string, CaseMedia> = Object.fromEntries(
  caseEvidenceLibrary.map((item) => {
    const shots = caseScreenshotsByEvidenceId[item.id] ?? [];
    return [item.id, { cover: shots[0], count: shots.length }];
  }),
);

/* The palette's case search needs only these three fields */
export const caseIndex = caseEvidenceLibrary.map(({ id, title, category }) => ({ id, title, category }));

const FEATURED_ID = "malware-analysis-wannacry";

const DATE_MS: Record<string, number> = Object.fromEntries(
  caseEvidenceLibrary.map((item) => [item.id, item.date ? new Date(item.date).getTime() : 0]),
);

/* Featured case first, then cases with screenshots, then newest first.
   Only the fields a card and the search use are kept: the case objects also
   carry their full screenshot list, which tripled the home page's payload
   (see mediaById below). */
const toCard = ({
  id, title, description, platform, type, category, difficulty, href, tags, tools, skillsGained, readTime, date, detailHref,
}: PdfResource): PdfResource => ({
  id, title, description, platform, type, category, difficulty, href, tags, tools, skillsGained, readTime, date, detailHref,
});

export const sortedCases: PdfResource[] = [...caseEvidenceLibrary].map(toCard).sort((a, b) => {
  if (a.id === FEATURED_ID) return -1;
  if (b.id === FEATURED_ID) return 1;
  const aShots = (caseScreenshotsByEvidenceId[a.id] ?? []).length > 0;
  const bShots = (caseScreenshotsByEvidenceId[b.id] ?? []).length > 0;
  if (aShots !== bShots) return aShots ? -1 : 1;
  return (DATE_MS[b.id] ?? 0) - (DATE_MS[a.id] ?? 0);
});

const countValues = (values: (string | undefined)[]): Facet[] => {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

export const categoryFacets = countValues(caseEvidenceLibrary.map((item) => item.category));
/* Only the most common tools — a very long chip list is noise, not filtering */
export const toolFacets = countValues(caseEvidenceLibrary.flatMap((item) => [...item.tools])).slice(0, 12);

export const libraryCounts = {
  total: caseEvidenceLibrary.length,
  reports: investigationReportCount,
  withScreenshots: caseEvidenceLibrary.filter((i) => (caseScreenshotsByEvidenceId[i.id] ?? []).length > 0).length,
  screenshots: Object.values(caseScreenshotsByEvidenceId).reduce((sum, shots) => sum + shots.length, 0),
};

const absoluteAsset = (href: string) => `${SITE_BASE_URL}/${href.replace(/^\/+/, "")}`;

/* The library as structured data: every case page, and its PDF where there is one */
export const libraryStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_BASE_URL}/#cases`,
  name: "Ahmed Emad Nasr — Case Library: SOC incident reports, DFIR write-ups & malware analysis",
  description:
    "SOC incident response reports, DFIR investigations, malware analysis and detection engineering cases with screenshots and documentation.",
  url: `${SITE_BASE_URL}/#cases`,
  author: { "@type": "Person", name: "Ahmed Emad Nasr" },
  hasPart: caseEvidenceLibrary.map((item) => ({
    "@type": "TechArticle",
    headline: item.title,
    url: caseUrl(item.id),
    datePublished: item.date,
    keywords: item.tags.join(", "),
    ...(item.href
      ? { associatedMedia: { "@type": "DigitalDocument", encodingFormat: "application/pdf", contentUrl: absoluteAsset(item.href) } }
      : {}),
  })),
};

/*
 * The ATT&CK coverage section, ready to render: every tactic in kill-chain
 * order, each covered technique with the case
 * titles behind it. Cases that are not in the library are dropped, so a
 * stale mapping can never produce a dead link.
 */
const TITLE_BY_ID = new Map(caseEvidenceLibrary.map((item) => [item.id, item.title]));
const COVERED = new Map(buildCoverage().map((column) => [column.tactic.id, column.techniques]));

export const attackCoverage = {
  tactics: ATTACK_TACTICS.map((tactic, index) => ({
    id: tactic.id,
    name: tactic.name,
    order: index + 1,
    techniques: (COVERED.get(tactic.id) ?? [])
      .map(({ technique, caseIds }) => ({
        id: technique.id,
        name: technique.name,
        cases: caseIds
          .filter((id) => TITLE_BY_ID.has(id))
          .map((id) => ({ id, title: TITLE_BY_ID.get(id) as string })),
      }))
      .filter((technique) => technique.cases.length > 0),
  })),
  techniqueCount: coveredTechniqueCount(),
  mappedCaseCount: Object.keys(caseAttackMapping).filter((id) => TITLE_BY_ID.has(id)).length,
};
