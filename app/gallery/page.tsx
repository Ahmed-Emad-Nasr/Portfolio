import type { Metadata } from "next";
import { PageShell } from "@/components/ui/kit";
import ArtGallery from "@/components/gallery/ArtGallery";
import SlashDivider from "@/components/ui/SlashDivider";
import TickerStrip from "@/components/ui/TickerStrip";
import { absoluteUrl, OG_IMAGE } from "@/lib/site";
import { jsonLd, PERSON_REF, SITE_URL } from "@/lib/seo";
import { PORTFOLIO_DATA } from "@/data/portfolio-data";

const DESCRIPTION = "Certificates, events, the classroom and moments from Ahmed Emad Nasr's information security journey.";

export const metadata: Metadata = {
  title: "Gallery — Proof, Certificates & Moments",
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

function structuredData() {
  const galleryUrl = absoluteUrl("/gallery");
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${galleryUrl}#gallery`,
    url: galleryUrl,
    name: "Proof gallery — Ahmed Emad Nasr",
    description: DESCRIPTION,
    about: PERSON_REF,
    author: PERSON_REF,
    isPartOf: { "@id": `${SITE_URL}#website` },
    image: PORTFOLIO_DATA.artGallery.map((item) => ({
      "@type": "ImageObject",
      contentUrl: absoluteUrl(item.src.replace(/^\/Portfolio/, "")),
      name: item.title,
      description: item.description,
      caption: item.title,
      creator: { "@type": "Person", name: item.creator },
      keywords: item.keywords.join(", "),
    })),
  });
}

export default function GalleryPage() {
  return (
    <PageShell showLoader>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData() }} />
      <SlashDivider label="01 // Visual archive" japanese="記録" origin="left" />
      <TickerStrip items={["証明", "記録", "軌跡", "PROOF IN FRAME"]} />
      <ArtGallery />
    </PageShell>
  );
}
