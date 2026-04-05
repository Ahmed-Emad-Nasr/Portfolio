import type { Metadata } from "next";
import BlogPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Cybersecurity blog resources from Ahmed Emad Nasr, including PDF case studies and YouTube technical videos.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}