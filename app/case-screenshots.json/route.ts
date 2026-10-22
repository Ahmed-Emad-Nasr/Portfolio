/*
 * /case-screenshots.json — every case's screenshot list, as one static file.
 *
 * The home page used to ship all ~950 screenshot paths inside its HTML (and
 * again in the React payload) so that any card could open its gallery. The
 * cards only need a cover and a count; the full list is fetched from here the
 * first time a visitor actually opens a gallery.
 */

import { caseScreenshotsByEvidenceId } from "@/app/core/config/cases";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(caseScreenshotsByEvidenceId), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
