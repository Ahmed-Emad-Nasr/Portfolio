import type { MetadataRoute } from "next";
import { serviceCatalog } from "@/app/core/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ahmed-emad-nasr.github.io/Portfolio";
  const defaultLastModified = process.env.NEXT_PUBLIC_SITE_LASTMOD ?? "2026-04-03";
  const lastModified = new Date(defaultLastModified);

  const serviceUrls = serviceCatalog.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...serviceUrls,
  ];
}
