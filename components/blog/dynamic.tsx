"use client";

/*
 * The blog page's dynamic imports (next/dynamic only code-splits when called
 * from a Client Component). The library remains server-rendered; ATT&CK,
 * detections and the triage quiz mount lazily near the viewport.
 */

import dynamic from "next/dynamic";
import LazySection, { preloadable } from "@/lib/perf/lazy";

export const CaseLibrarySection = dynamic(() => import("@/components/blog/CaseLibrarySection"));
const AttackCoverage = preloadable(() => import("@/components/blog/AttackCoverage"));
const DetectionLibrary = preloadable(() => import("@/components/blog/DetectionLibrary"));

export function LazyAttackCoverage() {
  return (
    <LazySection id="attack" size="lazy-h-attack">
      <AttackCoverage />
    </LazySection>
  );
}

export function LazyDetectionLibrary() {
  return (
    <LazySection id="detections" size="lazy-h-detection">
      <DetectionLibrary />
    </LazySection>
  );
}

const TriageChallenge = preloadable(() => import("@/components/blog/TriageChallenge"));

export function LazyTriage() {
  return (
    <LazySection id="triage" size="lazy-h-triage">
      <TriageChallenge />
    </LazySection>
  );
}
