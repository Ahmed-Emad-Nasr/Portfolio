/*
 * core/config/legal.ts
 *
 * Facts for the legal pages, in one place.
 *
 * ── Why a separate file ──
 *
 * The privacy and terms pages state facts about the site: what is collected, what
 * loads from a third party, how to contact me. If those facts are written
 * twice in two files, the moment something changes in the code one of them becomes a lie —
 * and a privacy notice that says something untrue is worse than having no notice at all.
 *
 * ⚠️ When you change the code, change this file too:
 *
 *   · Enabled analytics (NEXT_PUBLIC_PLAUSIBLE_DOMAIN)? → ANALYTICS
 *   · Added another contact form? → FORMS
 *   · Added any external script or embed? → THIRD_PARTY
 *   · Added any browser storage? → BROWSER_STORAGE
 */

export const LEGAL_LAST_UPDATED = "2026-09-07";

/** Contact details — the same email used across the site */
export const LEGAL_CONTACT = {
  name: "Ahmed Emad Nasr",
  email: "ahmed.em.nasr@gmail.com",
  country: "Egypt",
  /*
   * Deliberately no postal address here.
   *
   * This is a personal site for an individual, not a company. Publishing your home address on a public page is a
   * real personal security risk, and the law doesn't require it from an individual who isn't selling anything.
   * If it becomes a registered business, then the business details become required.
   */
} as const;

/**
 * The actual state of the site at the time the pages were written.
 * Every value here was verified against the code and the build, not from memory.
 */
export const SITE_FACTS = {
  /** No analytics script at all in the built HTML */
  ANALYTICS: false,
  /** No document.cookie anywhere in the code */
  COOKIES: false,
  /** No <form> anywhere on the built site */
  FORMS: false,
  /**
   * localStorage: a single key that saves the last section you were on in the navigation, so when
   * you come back you land in the same place. It's stored on your device and never sent to anyone.
   */
  BROWSER_STORAGE: ["The last section opened in the navigation menu"],
  /** Requests that may go to a third party from the visitor's browser */
  THIRD_PARTY: [
    {
      name: "YouTube (youtube-nocookie.com)",
      when: "Only when you click a video preview on the blog page yourself",
      note: "Uses the nocookie domain, and only loads after you click",
    },
    {
      name: "GitHub Pages",
      when: "Hosting of the site itself",
      note: "Logs the IP address in server logs, like any hosting provider",
    },
  ],
} as const;
