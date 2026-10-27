"use client";

/*
 * The case library with its data, as one lazy chunk: the cards, the facets
 * and the "start here" picks only download when the reader nears the
 * section (components/home/LazySections.tsx).
 */

import CaseLibrarySection from "./CaseLibrarySection";
import StartHere from "./StartHere";
import {
  categoryFacets,
  kindFacets,
  libraryCounts,
  mediaById,
  sortedCases,
  toolFacets,
} from "@/app/core/config/library-data";

export default function CaseLibraryBlock() {
  return (
    <CaseLibrarySection
      startHere={<StartHere />}
      sortedPdfs={sortedCases}
      mediaById={mediaById}
      categoryFacets={categoryFacets}
      toolFacets={toolFacets}
      kindFacets={kindFacets}
      totalCasesCount={libraryCounts.total}
      investigationReportCount={libraryCounts.reports}
      casesWithScreenshotsCount={libraryCounts.withScreenshots}
      totalScreenshotAssets={libraryCounts.screenshots}
    />
  );
}
