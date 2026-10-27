/* What the command palette searches (every case), fetched the first time it
   opens instead of being inlined into every page */

import { caseIndex } from "@/lib/library-data";

export const dynamic = "force-static";

export function GET() {
  return Response.json(caseIndex);
}
