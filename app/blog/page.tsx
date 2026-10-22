/*
 * app/blog/page.tsx — the old address of the case library
 *
 * The library now lives at the end of the one-page portfolio (/#cases).
 * This page only forwards there, keeping any ?q= / ?cat= filters and any
 * #case-… anchor, so links shared before the move keep working. The case
 * pages themselves (/blog/<id>) are unchanged.
 */

import type { Metadata } from "next";
import BlogRedirect from "./BlogRedirect";

export const metadata: Metadata = {
  title: "Case Library",
  description: "The case library has moved to the portfolio's home page.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return <BlogRedirect />;
}
