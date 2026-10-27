"use client";

/*
 * The blog page's dynamic imports (next/dynamic only code-splits when called
 * from a Client Component). The library, ATT&CK and detections are
 * server-rendered in their own chunks (search engines should find them);
 * the triage quiz is lazy (lib/perf/lazy.tsx).
 */

import dynamic from "next/dynamic";
import LazySection, { preloadable } from "@/lib/perf/lazy";

export const CaseLibrarySection = dynamic(() => import("@/components/blog/CaseLibrarySection"));
export const AttackCoverage = dynamic(() => import("@/components/blog/AttackCoverage"));
export const DetectionLibrary = dynamic(() => import("@/components/blog/DetectionLibrary"));

const TriageChallenge = preloadable(() => import("@/components/blog/TriageChallenge"));

export function LazyTriage() {
  return (
    <LazySection id="triage" size="lazy-h-triage">
      <TriageChallenge />
    </LazySection>
  );
}
