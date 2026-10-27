/* robots.txt. Crawlers only read it at the domain root (the github.io root is
   shared), so submit the sitemap in Search Console too. */

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Required with output: "export" — Next 16 rejects any metadata route
// without it, even when the function contains nothing dynamic.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    // No `host`: it is a Yandex-only directive, ignored by Google and flagged
    // by validators when it carries a scheme and a path.
  };
}
