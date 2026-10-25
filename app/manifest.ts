import type { MetadataRoute } from "next";
import { normalizePublicHref } from "@/app/core/config/shared";

// Required with output: "export" — exactly like sitemap.ts and robots.ts.
// Without it, next build fails during "Collecting page data" with:
//   "export const dynamic = force-static/revalidate not configured
//    on route /manifest.webmanifest with output: export"
export const dynamic = "force-static";

/*
 * manifest.ts
 *
 * The metadata in layout.tsx contains `appleWebApp: { capable: true }` —
 * the site declares itself installable to the home screen. Without a
 * manifest that declaration was incomplete: Android showed no install
 * option at all, and iOS took a screenshot of the page and used it as the
 * icon.
 *
 * Next generates /manifest.webmanifest from this file at build time, and
 * prefixes the paths with the basePath on its own.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahmed Emad Nasr — Information Security Officer",
    short_name: "3omda",
    description:
      "Information security portfolio: GRC and compliance, SOC operations, incident response and DFIR, malware analysis, IAM and data security — case reports, projects and videos.",
    lang: "en",
    dir: "ltr",
    categories: ["security", "education", "business"],
    /* The site lives under /Portfolio on GitHub Pages: "/" would open the
       github.io root from an installed app */
    start_url: normalizePublicHref("/"),
    scope: normalizePublicHref("/"),
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    /* 192 and 512 are the sizes Android asks for. The maskable one keeps the
       mark inside the 80% safe zone, because launchers crop it to a circle
       or squircle. Generated from the site font (see README → Icons). */
    icons: [
      { src: normalizePublicHref("icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: normalizePublicHref("icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: normalizePublicHref("icons/maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
