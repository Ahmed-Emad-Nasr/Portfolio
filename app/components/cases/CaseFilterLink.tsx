"use client";

/*
 * CaseFilterLink — a link anywhere on the site that opens the case library
 * (/#cases) already filtered ("Wazuh → the 6 cases that use it").
 *
 * From another page it is a plain link to /?q=…#cases. On the home page
 * itself a next/link to "?q=…" would not remount the library and its filters
 * would not change. Instead the link writes the query
 * into the URL, fires the same popstate event the back button does (which the
 * library already listens to), and scrolls to it. Without JavaScript it is a
 * plain link to the same filtered URL.
 */

import type { ReactNode } from "react";
import { normalizePublicHref } from "@/app/core/config/shared";
import { revealAll, scrollToHash } from "@/app/core/components/LazySection";

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
  const href = `${normalizePublicHref("/")}?${search}#cases`;
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!document.getElementById("cases")) return; // not on the home page: follow the link
        e.preventDefault();
        window.history.pushState(null, "", `${window.location.pathname}?${search}#cases`);
        /* The library may not be loaded yet (core/components/LazySection.tsx) */
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
