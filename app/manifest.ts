import type { MetadataRoute } from "next";

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
    name: "Ahmed Emad Nasr — SOC & Cybersecurity Analyst",
    short_name: "3omda",
    description:
      "SOC operations, incident response, digital forensics, and malware analysis case reports.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    /*
     * The sizes Android asks for are 192 and 512. This image is square
     * (560×560) so it works as an icon, but it is not the ideal size.
     *
     * ⭐ For a proper icon: export 192 and 512, put them in
     *   public/Assets/icons/ and change the paths here. purpose:
     *   "maskable" needs a safe margin around the logo (20% on each side)
     *   because Android crops the icon to a circle on some devices.
     */
    icons: [
      {
        src: "/Assets/art-gallery/Images/logo/3omda.webp",
        sizes: "560x560",
        type: "image/webp",
      },
    ],
  };
}
