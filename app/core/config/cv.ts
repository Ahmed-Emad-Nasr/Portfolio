/*
 * core/config/cv.ts
 * Author: Ahmed Emad Nasr
 *
 * The few things the /cv page needs that are not in any other config.
 *
 * Note that this file contains **no** experience, projects, certifications,
 * awards or skills: all of those are read from their original sources
 * (experience.ts, projects.ts, certifications.ts, achievements.ts,
 * skills.ts).
 *
 * That is deliberate. The easy way to build a CV page is to copy the text
 * into it — and two months later the site says one number and the CV says
 * another, which is exactly the problem that exists today between your site
 * and your PDF. A single source makes that impossible.
 */

import { investigationReportCount, publishedCaseCount } from "./cases";
import { coveredTechniqueCount } from "./attack";

export const CV_CONTACT = {
  name: "Ahmed Emad Nasr",
  headline: "SOC Analyst · Incident Response · DFIR",
  location: "Cairo, Egypt",
  email: "ahmed.em.nasr@gmail.com",
  phone: "+20 101 397 2690",
  linkedin: { label: "linkedin.com/in/ahmed-emad-nasr", href: "https://www.linkedin.com/in/ahmed-emad-nasr/" },
  github: { label: "github.com/AE-Nasr", href: "https://github.com/AE-Nasr" },
  site: { label: "ae-nasr.github.io/Portfolio", href: "https://ae-nasr.github.io/Portfolio/" },
} as const;

/** Related coursework — present in the PDF, absent from experience.ts */
export const RELEVANT_COURSEWORK = [
  "Network Security",
  "Digital Forensics",
  "Cryptography",
  "Operating Systems",
  "Ethical Hacking",
] as const;

/** Path to the PDF. Goes through normalizePublicHref like any other asset. */
export const CV_PDF_HREF = "Assets/cv/AhmedEmadNasr_CV.pdf";

/**
 * The opening line. This is the only place on the site that states outright
 * what you are looking for — and that is the first question in the mind of
 * anyone opening a CV.
 */
/*
 * ⚠️ Both numbers are computed from the data, not hand-written.
 *
 * It used to say "Published 38 investigation reports" — and that number didn't match
 * any count in cases.ts. Meanwhile the site was saying 42.
 *
 * Now they're read from cases.ts, so if you add a new report the number updates in
 * both places by itself and they can never contradict each other.
 *
 * The technique count is also computed from attack.ts now instead of a hard-coded 28.
 */
export const CV_SUMMARY =
  "Information Security graduate working across SOC operations, incident response, and digital forensics. " +
  `Published ${investigationReportCount} investigation reports across ${publishedCaseCount} documented cases, ` +
  `covering ${coveredTechniqueCount()} MITRE ATT&CK techniques, contributed a detection rule to ` +
  "the open-source SOC Fortress project, and taught security fundamentals to 160+ students.";
