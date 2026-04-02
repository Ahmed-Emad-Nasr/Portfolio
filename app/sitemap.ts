import type { MetadataRoute } from "next";
import { serviceCatalog } from "@/app/core/data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ahmed-emad-nasr.github.io/Portfolio";
  const serviceUrls = serviceCatalog.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...serviceUrls,
  ];
}
