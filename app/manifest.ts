import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/Portfolio/",
    name: "Ahmed Emad Nasr - Portfolio",
    short_name: "Ahmed Portfolio",
    description:
      "SOC Analyst and Cybersecurity Engineer portfolio focused on Incident Response, Threat Hunting, DFIR, and security operations.",
    start_url: "/Portfolio/",
    scope: "/Portfolio/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en",
    categories: ["technology", "security", "education"],
    shortcuts: [
      {
        name: "Contact",
        short_name: "Contact",
        description: "Jump directly to contact section",
        url: "/Portfolio/#Contact",
      },
      {
        name: "Projects",
        short_name: "Projects",
        description: "View featured projects",
        url: "/Portfolio/#Projects",
      },
    ],
    icons: [
      {
        src: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "maskable",
      },
      {
        src: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  };
}
