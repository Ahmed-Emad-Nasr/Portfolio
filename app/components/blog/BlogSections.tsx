"use client";

/*
 * Every dynamic import on the blog page, in one place (a Client file:
 * next/dynamic only code-splits when called from a Client Component —
 * see components/home/LazySections.tsx).
 *
 *   Server-rendered, own chunk   the case library, the ATT&CK coverage and
 *                                 the detection rules: in the HTML, because
 *                                 they are what search engines should find
 *                                 here ("DFIR case studies", "Wazuh rules").
 *                                 Each one's code and data is its own chunk;
 *                                 the data is imported by the chunk, not sent
 *                                 a second time as props in the page payload.
 *   Lazy                          the triage challenge — a quiz, nothing to
 *                                 index: preloaded in idle time, mounted
 *                                 before the reader reaches it
 *                                 (core/perf/lazy.tsx).
 */

import dynamic from "next/dynamic";
import LazySection, { preloadable } from "@/app/core/perf/lazy";

export const CaseLibraryBlock = dynamic(() => import("@/app/components/cases/CaseLibraryBlock"));
export const AttackBlock = dynamic(() => import("@/app/components/cases/AttackBlock"));
export const DetectionLibrary = dynamic(() => import("@/app/components/cases/DetectionLibrary"));

const TriageChallenge = preloadable(() => import("@/app/components/cases/TriageChallenge"));

export function LazyTriage() {
  return (
    <LazySection id="triage" size="lazy-h-triage">
      <TriageChallenge />
    </LazySection>
  );
}
