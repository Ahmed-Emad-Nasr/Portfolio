/*
 * app/gallery/page.tsx — the proof gallery: certificates, events, the
 * classroom and moments along the way.
 *
 * It used to be the last section of the about page, under eight other
 * sections. Like the blog and the about page it now has its own address
 * (nav "Gallery", command palette, /about#art and /#art forward here —
 * core/config/routes.ts).
 */

import type { Metadata } from "next";
import { PageShell } from "@/app/components/shared/kit";
import ArtGallery from "@/app/components/art-gallery/ArtGallery";
import { GALLERY_IMAGE_COUNT, galleryImagePath } from "@/app/core/config/certifications";
import { PERSON_REF, SITE_URL, jsonLd } from "@/app/core/config/seo";
import { absoluteUrl, OG_IMAGE } from "@/app/core/config/site";

const DESCRIPTION =
  "The proof gallery of Ahmed Emad Nasr: certificates, events, the classroom and moments from the path in information security.";

export const metadata: Metadata = {
  title: "Gallery — Certificates & Moments",
  description: DESCRIPTION,
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery — Ahmed Emad Nasr",
    description: DESCRIPTION,
    url: absoluteUrl("/gallery"),
    type: "website",
    siteName: "Ahmed Emad Nasr Portfolio",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: "Gallery — Ahmed Emad Nasr", description: DESCRIPTION, images: [OG_IMAGE.url] },
};

const STRUCTURED_DATA = jsonLd({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": `${absoluteUrl("/gallery")}#page`,
  url: absoluteUrl("/gallery"),
  name: "Gallery — Ahmed Emad Nasr",
  description: DESCRIPTION,
  about: PERSON_REF,
  author: PERSON_REF,
  isPartOf: { "@id": `${SITE_URL}#website` },
  inLanguage: "en",
  image: Array.from({ length: GALLERY_IMAGE_COUNT }, (_, i) => absoluteUrl(galleryImagePath(i + 1))),
});

export default function GalleryPage() {
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />
      <ArtGallery />
    </PageShell>
  );
}
