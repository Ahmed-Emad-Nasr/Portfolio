/*
 * MovedToSection — compatibility page for old section addresses such as
 * /about: an instant hop to the current home-page section.
 */

import type { Metadata } from "next";
import { normalizePublicHref } from "@/lib/shared";

export const movedMetadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function MovedToSection({ section }: { section: string }) {
  const home = normalizePublicHref("/");
  const script = `location.replace(${JSON.stringify(home)}+location.search+(location.hash.length>1?location.hash:${JSON.stringify(`#${section}`)}))`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${home}#${section}`} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <p className="p-10 font-mono text-sm">
        This page is now a section of the home page: <a className="underline" href={`${home}#${section}`}>open it</a>.
      </p>
    </>
  );
}
