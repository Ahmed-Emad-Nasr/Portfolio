"use client";

/*
 * CaseFilterLink — a link that opens the case library already filtered
 * (/blog?q=wazuh#cases). On the blog page itself it updates the URL and
 * fires popstate (the library listens) instead of navigating.
 */

import type { ReactNode } from "react";
import { normalizePublicHref } from "@/lib/shared";
import { revealAll } from "@/lib/perf/schedule";
import { scrollToHash } from "@/lib/perf/jump";

type Props = {
  /** URL search params for the library: { q: "Wazuh" } or { kind: "investigation" } */
  params: Record<string, string>;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  title?: string;
};

export default function CaseFilterLink({ params, className, children, ...rest }: Props) {
  const search = new URLSearchParams(params).toString();
  const href = `${normalizePublicHref("/blog")}?${search}#cases`;
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!document.getElementById("cases")) return; // not on the blog page: follow the link
        e.preventDefault();
        window.history.pushState(null, "", `${window.location.pathname}?${search}#cases`);
        /* The library may not be loaded yet (lib/perf/lazy.tsx) */
        revealAll().then(() => {
          window.dispatchEvent(new PopStateEvent("popstate"));
          scrollToHash("#cases");
        });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
