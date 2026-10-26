/*
 * core/config/certifications.ts
 * Author: Ahmed Emad Nasr
 *
 * This data is taken from the CV. Previously the certifications existed on the site
 * as 74 images all with alt="Certification" — which meant:
 *
 *  - the screen reader announced the same word 74 times.
 *  - Google couldn't tell this one is eJPT, that one CCNA, that one RH124.
 *  - and nobody could verify any of them.
 *
 * Now the known certifications have real data (name, issuer, year), are shown
 * as a readable list above the image wall, and emit JSON-LD of type
 * EducationalOccupationalCredential.
 *
 * ⚠️ Two things still need to be filled in:
 *  1. `verifyUrl` — the verification link from each issuer (Credly / INE / Cisco / Red Hat).
 *     That's what turns the line from a claim into evidence.
 *  2. `galleryIndex` — the number of the matching image in image_display/{N}.webp.
 *     It can't be determined without looking at the images. Without it the certification still shows in the list
 *     as normal, but isn't linked to its image.
 */

type Certification = {
  /** Stable id — used as the key and in the JSON-LD */
  id: string;
  /** Certification name exactly as written on it */
  name: string;
  /** The abbreviation people search for */
  shortName?: string;
  /** Issuing organisation */
  issuer: string;
  /** Year obtained */
  year: number;
  /** Verification link from the issuer itself */
  verifyUrl?: string;
  /** Image number in image_display/{N}.webp, if known */
  galleryIndex?: number;
  /** false = listed on the site but not on the CV page (it isn't in the PDF) */
  cv?: boolean;
  /** "exam" = passed a proctored/graded exam; "course" = completion of a
      course or learning path. Left out where it isn't certain. */
  credential?: "exam" | "course";
};

/** Ordered newest to oldest — same order as the CV */
/* Order and wording follow the CV PDF. */
export const certifications: readonly Certification[] = [
  { id: "ejpt-v2", credential: "exam", name: "eLearnSecurity Junior Penetration Tester v2", shortName: "eJPT v2", issuer: "INE", year: 2026, galleryIndex: 2 },
  { id: "ccep", name: "Certified Cybersecurity Educator Professional", shortName: "CCEP", issuer: "Red Team Leaders", year: 2026, galleryIndex: 6 },
  { id: "rh124", name: "Red Hat System Administration I (RH124)", shortName: "RH124", issuer: "Red Hat", year: 2026, galleryIndex: 10 },
  { id: "hcia-datacom", name: "HCIA-Datacom V1.0 & HCCDA-Tech Essentials", shortName: "HCIA-Datacom", issuer: "Huawei", year: 2025, galleryIndex: 24 },
  { id: "thm-soc-l1-l2", credential: "course", name: "SOC Level 1 & SOC Level 2 Learning Paths", issuer: "TryHackMe", year: 2025, galleryIndex: 12 },
  { id: "malware-analysis-fundamentals", credential: "course", name: "Malware Analysis Fundamentals", issuer: "Mahara-Tech (ITI)", year: 2025, galleryIndex: 27 },
  { id: "cti-101", credential: "course", name: "Cyber Threat Intelligence 101", issuer: "arcX", year: 2025, galleryIndex: 15 },
  { id: "ccna", credential: "exam", name: "Cisco Certified Network Associate (CCNA 200-301)", shortName: "CCNA", issuer: "Cisco Systems", year: 2024 },
  { id: "hcia-cloud", name: "HCIA-Cloud Computing V5.0", shortName: "HCIA-Cloud", issuer: "Huawei", year: 2024, cv: false, galleryIndex: 25 },
];

/*
 * Total number of gallery images (image_display_thumb/1.webp … N.webp).
 *
 * 98 since October 2026: the 75 that were in the folder (74 and 75 had been
 * added but never shown — the count still said 73) plus 23 certificates,
 * exam results and badges that were missing, inserted after the existing
 * certificates (27–49) so the photos (now 50–98) stay together at the end.
 *
 * If you add new images, increase this number — and the check:assets script will tell you immediately
 * if the number exceeds the file count.
 */
export const GALLERY_IMAGE_COUNT = 98;

/*
 * What each certificate image in the gallery is — shown on hover, in the
 * lightbox and as the image's alt text. Wording follows the certificate
 * itself. Numbers not listed here (the photos) keep their "Record NN" title.
 */
const GALLERY_TITLES: Readonly<Record<number, string>> = {
  1: "Banque Misr — Rowad Program, Certificate of Completion",
  2: "eJPT — Junior Penetration Tester · INE Security",
  3: "Incident Handling & Response Professional · INE",
  4: "DEPI — Information Security Analyst (Infrastructure & Security)",
  5: "DEPI — Cyber Security Incident Response Analyst",
  6: "Certified Cybersecurity Educator Professional (CCEP) · Red Team Leaders",
  7: "CCNA: Introduction to Networks · Cisco Networking Academy",
  8: "CCNA: Switching, Routing & Wireless Essentials · Cisco Networking Academy",
  9: "CCNA: Enterprise Networking, Security & Automation · Cisco Networking Academy",
  10: "Red Hat System Administration I (RH124) · Red Hat",
  11: "SOC Level 1 Learning Path · TryHackMe",
  12: "SOC Level 2 Learning Path · TryHackMe",
  13: "Introduction to Cybersecurity Bootcamp · CyberTalents",
  14: "ITI Universities Pentesting Bootcamp 2025 · CyberTalents & ITI",
  15: "Cyber Threat Intelligence 101 · arcX",
  16: "Cybersecurity for Beginners · Mahara-Tech (ITI)",
  17: "SEC450 — GSOC Prep · NetRiders",
  18: "eCIR Prep · NetRiders",
  19: "Security+ SY0-601 Prep · NetRiders Academy",
  20: "Red Teaming, Ethical Hacking, Bug Hunting & Penetration Test · Udemy",
  21: "SEC504 — GCIH Prep · NetRiders",
  23: "HCCDA-Tech Essentials · Huawei ICT Academy",
  24: "HCIA-Datacom V1.0 · Huawei Talent Online",
  25: "HCIA-Cloud Computing V5.0 · Huawei ICT Academy",
  26: "Cyber Security (120 hours) · Information Technology Institute (ITI)",
  27: "Malware Analysis Fundamentals · Mahara-Tech (ITI)",
  28: "Jr Penetration Tester Learning Path · TryHackMe",
  29: "Junior Cybersecurity Analyst Career Path · Cisco Networking Academy",
  30: "Student SOC Program Foundations · Microsoft",
  31: "DEPI — Forensics Investigator (Infrastructure & Security)",
  32: "DEPI — Business English Track, Round 3 · OTO Courses",
  33: "Digital Forensics Fundamentals · NetRiders",
  34: "eJPTv1 Prep · Netriders Academy",
  35: "HCIA-Datacom Learning Course — Certificate of Attendance · Huawei",
  36: "GDG on Campus Benha BootCamp 24/25 — Cyber Security Technical",
  37: "CCNA (200-301) Certification Practice Exam — 98%",
  38: "Network Security — Course Final Exam, 97%",
  39: "CCNA Semester 1 — Course Final Exam, 98%",
  40: "CCNA Semester 2 — Course Final Exam, 92%",
  41: "CCNA Semester 3 — Course Final Exam, 88%",
  42: "CCNA Semester 1 — Checkpoint Exam, IP Addressing, 100%",
  43: "CCNA Semester 2 — Checkpoint Exam, Switching, VLANs & Inter-VLAN Routing, 97%",
  44: "CCNA Semester 3 — Checkpoint Exam, OSPF Concepts & Configuration, 100%",
  45: "eJPT — Junior Penetration Tester badge · INE",
  46: "Verified badge — CCNA: Introduction to Networks · Cisco",
  47: "Verified badge — CCNA: Switching, Routing & Wireless Essentials · Cisco",
  48: "Verified badge — CCNA: Enterprise Networking, Security & Automation · Cisco",
  49: "Verified badge — Junior Cybersecurity Analyst Career Path · Cisco",
};

/** A gallery image's title: its certificate name, or "Record NN" for photos */
export const galleryTitle = (index: number): string =>
  GALLERY_TITLES[index] ?? `Record ${String(index).padStart(2, "0")}`;

/** Path (without the base path) of gallery image number `index` */
export const galleryImagePath = (index: number): string =>
  `Assets/art-gallery/Images/image_display_thumb/${index}.webp`;

/**
 * JSON-LD for every certification. Google uses this type in search results for
 * credentials, and CV parsers read it.
 */
export const certificationsJsonLd = (personId: string) =>
  certifications.map((cert) => ({
    "@type": "EducationalOccupationalCredential",
    name: cert.name,
    credentialCategory: "certification",
    educationalLevel: "professional",
    dateCreated: String(cert.year),
    recognizedBy: { "@type": "Organization", name: cert.issuer },
    ...(cert.verifyUrl ? { url: cert.verifyUrl } : {}),
    about: { "@id": personId },
  }));
