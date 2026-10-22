/*
 * .well-known/security.txt — RFC 9116, emitted as a static file at build.
 * The content lives in core/config/security.ts.
 */

import { securityTxt } from "@/app/core/config/security";

export const dynamic = "force-static";

export function GET() {
  return new Response(securityTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
