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
 *   · Analytics are read from core/config/analytics.ts (set by env at build time)
 *   · Added another contact form? → FORMS
 *   · Added any external script or embed? → THIRD_PARTY
 *   · Added any browser storage? → BROWSER_STORAGE
 */

export const LEGAL_LAST_UPDATED = "2026-10-26";

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
  /** No document.cookie anywhere in the code */
  COOKIES: false,
  /** No <form> anywhere on the built site */
  FORMS: false,
  /**
   * localStorage: a single key that saves the last section you were on in the navigation, so when
   * you come back you land in the same place. It's stored on your device and never sent to anyone.
   */
  BROWSER_STORAGE: [
    "Your light or dark theme choice",
    "The theme-transition speed, if you change it in the command palette",
    "Whether the intro screen already played in this tab (cleared when the tab closes)",
    "Whether the keyboard-shortcut tip was already shown",
  ],
  /** Requests that may go to a third party from the visitor's browser */
  THIRD_PARTY: [
    {
      name: "YouTube (youtube-nocookie.com)",
      when: "Only when you click a video preview in the video section yourself",
      note: "Uses the nocookie domain, and only loads after you click",
    },
    {
      /* Missing before: the preview images load as soon as the video
         section scrolls into view, without a click */
      name: "YouTube thumbnails (i.ytimg.com)",
      when: "When the video section of the blog page scrolls into view, to show the preview images",
      note: "A plain image request: Google receives your IP address, no cookies are set, and no player loads",
    },
    {
      name: "github-contributions-api.jogruber.de",
      when: "When you scroll near the GitHub contribution graph on the about page, to draw it",
      note: "A public, open-source service; it receives your IP address like any web request, and nothing else",
    },
    ...(process.env.NEXT_PUBLIC_GISCUS_REPO_ID
      ? [
          {
            name: "Giscus (giscus.app) and GitHub",
            when: "Only when you press \"Load comments\" under a blog post",
            note: "Loads the post's comment thread, stored as a GitHub Discussion; posting a comment needs a GitHub sign-in, handled by GitHub",
          },
        ]
      : []),
    ...(process.env.NEXT_PUBLIC_WEB3FORMS_KEY
      ? [
          {
            name: "Web3Forms (api.web3forms.com)",
            when: "Only when you send the contact form",
            note: "Relays what you typed in the form (name, e-mail, reason, message) to my inbox; nothing else is sent",
          },
        ]
      : []),
    {
      name: "GitHub Pages",
      when: "Hosting of the site itself",
      note: "Logs the IP address in server logs, like any hosting provider",
    },
  ],
} as const;
