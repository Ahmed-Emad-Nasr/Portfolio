import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://ahmed-emad-nasr.github.io/Portfolio/sitemap.xml",
    host: "https://ahmed-emad-nasr.github.io",
  };
}
