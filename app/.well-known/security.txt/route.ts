/*
 * .well-known/security.txt — RFC 9116, emitted as a static file at build.
 * The content lives in lib/security.ts.
 */

import { securityTxt } from "@/lib/security";

export const dynamic = "force-static";

export function GET() {
  return new Response(securityTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
