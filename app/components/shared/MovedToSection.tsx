/*
 * MovedToSection — what the old addresses (/blog, /about, /gallery) serve
 * now that they are sections of the home page: an instant hop to the section on the home
 * page, keeping any filters and anchor (/blog?q=wazuh#cases → /?q=wazuh#cases).
 * Links shared on LinkedIn, in a CV or in search results keep working.
 * Without JavaScript the meta refresh does the same.
 */

import type { Metadata } from "next";
import { normalizePublicHref } from "@/app/core/config/shared";

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
