import type { Metadata } from "next";
import InsightsClient from "./InsightsClient";

export const metadata: Metadata = {
  title: "Insights Dashboard | Ahmed Emad Nasr",
  description: "Portfolio engagement insights and funnel monitoring dashboard.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Portfolio Insights Dashboard",
    description: "Track visits, CV actions, and contact conversions in one view.",
    type: "website",
    url: "https://ahmed-emad-nasr.github.io/Portfolio/insights",
    images: [
      {
        url: "/Assets/art-gallery/Images/logo/My_Logo.webp",
        width: 1200,
        height: 630,
        alt: "Portfolio Insights Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Insights Dashboard",
    description: "Track visits, CV actions, and contact conversions in one view.",
    images: ["/Assets/art-gallery/Images/logo/My_Logo.webp"],
  },
};

export default function InsightsPage() {
  return <InsightsClient />;
}
