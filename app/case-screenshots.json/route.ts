/* Every case's screenshot list, fetched the first time a gallery opens
   (the cards only carry a cover and a count). */

import { caseScreenshotsByEvidenceId } from "@/data/cases";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(caseScreenshotsByEvidenceId), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
