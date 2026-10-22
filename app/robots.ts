/*
 * robots.ts
 * Author: Ahmed Emad Nasr
 *
 * ⚠️ Important: crawlers read robots.txt from the domain root only — i.e.
 * https://ahmed-emad-nasr.github.io/robots.txt, not /Portfolio/robots.txt.
 * That root is shared across all your GitHub Pages projects, so it is not
 * under this repository's control.
 *
 * This file is useful in two cases: if you put a custom domain on the root,
 * or as a reference stating your intent. The sitemap itself works fine —
 * submit it manually from Search Console.
 */

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/app/core/config/site";

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
