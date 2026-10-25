/*
 * core/config/seo.ts
 * Author: Ahmed Emad Nasr
 *
 * One place for everything search engines read about the person behind the
 * site: the stable JSON-LD @ids every page points at, the profiles that prove
 * the identity (sameAs), and the keyword sets.
 *
 * Why the @ids matter: before this, each page described "a Person named Ahmed
 * Emad Nasr" from scratch, so Google saw several unrelated people with the
 * same name. Now every article, video, service and CV page points at the one
 * #person node from layout.tsx, and the profiles in SAME_AS tie that node to
 * the LinkedIn, GitHub, YouTube and training-platform accounts — which is what
 * a knowledge panel is built from.
 *
 * Keywords are curated, not stuffed: Google ignores <meta name="keywords">,
 * Bing and Yandex give it a little weight, and a list of 200 terms reads as
 * spam to all of them. The real ranking signals are the titles, descriptions,
 * headings and structured data — the keywords here mirror those.
 */

import { SITE_BASE_URL } from "./site";
import { YOUTUBE_CHANNEL_URL } from "./shared";

export const SITE_URL = `${SITE_BASE_URL}/`;

export const PERSON_ID = `${SITE_URL}#person`;
export const WEBSITE_ID = `${SITE_URL}#website`;
export const CHANNEL_ID = `${SITE_URL}#youtube-channel`;

export const PERSON_NAME = "Ahmed Emad Nasr";
export const PERSON_IMAGE = `${SITE_BASE_URL}/Assets/art-gallery/Images/logo/3omda.webp`;

/** A reference to the one Person node — use this instead of a fresh `{ "@type": "Person" }` */
export const PERSON_REF = { "@id": PERSON_ID } as const;

/*
 * Every public profile that is the same person. Order: the strongest identity
 * signals first. Only profiles the site already links to publicly.
 */
export const SAME_AS = [
  "https://www.linkedin.com/in/ahmed-emad-nasr/",
  "https://github.com/Ahmed-Emad-Nasr",
  YOUTUBE_CHANNEL_URL,
  "https://x.com/0x3omda",
  "https://www.instagram.com/ahmed_emad_nasr/",
  "https://tryhackme.com/p/Ahmed.Emad.Nasr",
  "https://profile.hackthebox.com/profile/01a13b5b-f63f-737f-9adc-91a78153a84f",
  "https://cyberdefenders.org/p/ahmed.em.nasr",
  "https://cybertalents.com/members/3omdaa",
] as const;

/*
 * The site-wide keyword set. Grouped by intent so it stays readable and so a
 * page can pick the group that fits it.
 */
export const KEYWORDS = {
  identity: [
    "Ahmed Emad Nasr",
    "Ahmed Emad",
    "Ahmed Nasr",
    "3omda",
    "0x3omda",
    "أحمد عماد نصر",
  ],
  roles: [
    "Information Security Officer",
    "Information Security Analyst",
    "Cybersecurity Analyst",
    "GRC Analyst",
    "SOC Analyst",
    "Incident Response Analyst",
    "DFIR Analyst",
    "Malware Analyst",
    "IAM Analyst",
    "Data Security Analyst",
    "Cybersecurity Instructor",
  ],
  grc: [
    "Governance Risk and Compliance",
    "ISO 27001",
    "PCI DSS",
    "NIST CSF",
    "COBIT",
    "SWIFT CSP",
    "risk assessment",
    "gap assessment",
    "security policies",
  ],
  operations: [
    "Security Operations Center",
    "SIEM",
    "Wazuh",
    "Splunk",
    "Suricata",
    "EDR",
    "threat hunting",
    "detection engineering",
    "MITRE ATT&CK",
  ],
  response: [
    "incident response",
    "digital forensics",
    "memory forensics",
    "malware analysis",
    "reverse engineering",
    "threat intelligence",
  ],
  identityData: [
    "Identity and Access Management",
    "Privileged Access Management",
    "Active Directory",
    "data security",
    "data loss prevention",
  ],
  place: [
    "cybersecurity Egypt",
    "information security Cairo",
    "SOC analyst Egypt",
    "GRC analyst Egypt",
    "أمن المعلومات",
    "الأمن السيبراني",
  ],
} as const;

/** The site-wide list: every group, deduplicated */
export const SITE_KEYWORDS: string[] = [...new Set(Object.values(KEYWORDS).flat())];

/** O*NET-SOC code for "Information Security Analysts" — the standard occupation id */
export const OCCUPATION = {
  "@type": "Occupation",
  name: "Information Security Officer",
  alternateName: ["Information Security Analyst", "Cybersecurity Analyst"],
  occupationalCategory: {
    "@type": "CategoryCode",
    codeValue: "15-1212.00",
    name: "Information Security Analysts",
    inCodeSet: { "@type": "CategoryCodeSet", name: "O*NET-SOC", url: "https://www.onetonline.org/" },
  },
  occupationLocation: { "@type": "Country", name: "Egypt" },
} as const;

/** YouTube thumbnail URL — hqdefault always exists, maxres does not */
export const youtubeThumb = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
export const youtubeWatch = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;
export const youtubeEmbed = (videoId: string) => `https://www.youtube-nocookie.com/embed/${videoId}`;

/*
 * Serialises structured data for a <script type="application/ld+json">.
 *
 * Plain JSON.stringify is not safe there: two case descriptions quote their
 * own XSS payload (`<script>alert(1)</script>`), and the "</script>" inside
 * the JSON closed the tag early — the structured data was cut in half and
 * the rest of the JSON spilled onto the page as text. Escaping "<" (and the
 * two line separators JSON allows but JavaScript does not) keeps the output
 * identical for any JSON parser and makes the tag impossible to break out of.
 */
export const jsonLd = (data: unknown): string =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
