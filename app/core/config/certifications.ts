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

export type Certification = {
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
};

/** Ordered newest to oldest — same order as the CV */
/* Order and wording follow the CV PDF. */
export const certifications: readonly Certification[] = [
  { id: "ejpt-v2", name: "eLearnSecurity Junior Penetration Tester v2", shortName: "eJPT v2", issuer: "INE", year: 2026 },
  { id: "ccep", name: "Certified Cybersecurity Educator Professional", shortName: "CCEP", issuer: "Red Team Leaders", year: 2026 },
  { id: "rh124", name: "Red Hat System Administration I (RH124)", shortName: "RH124", issuer: "Red Hat", year: 2026 },
  { id: "hcia-datacom", name: "HCIA-Datacom V1.0 & HCCDA-Tech Essentials", shortName: "HCIA-Datacom", issuer: "Huawei", year: 2025 },
  { id: "thm-soc-l1-l2", name: "SOC Level 1 & SOC Level 2 Learning Paths", issuer: "TryHackMe", year: 2025 },
  { id: "malware-analysis-fundamentals", name: "Malware Analysis Fundamentals", issuer: "Mahara-Tech (ITI)", year: 2025 },
  { id: "cti-101", name: "Cyber Threat Intelligence 101", issuer: "arcX", year: 2025 },
  { id: "ccna", name: "Cisco Certified Network Associate (CCNA 200-301)", shortName: "CCNA", issuer: "Cisco Systems", year: 2024 },
  { id: "hcia-cloud", name: "HCIA-Cloud Computing V5.0", shortName: "HCIA-Cloud", issuer: "Huawei", year: 2024, cv: false },
];

/*
 * Total number of gallery images.
 *
 * It was 74, but what actually exists in public/…/image_display_thumb/ is **73**
 * (1.webp to 73.webp). So image number 74 was a 404 on every load of the
 * certifications section.
 *
 * If you add new images, increase this number — and the check:assets script will tell you immediately
 * if the number exceeds the file count.
 */
export const GALLERY_IMAGE_COUNT = 73;

/** Quick lookup by galleryIndex so we don't scan the array for every image */
const byGalleryIndex = new Map<number, Certification>(
  certifications
    .filter((c): c is Certification & { galleryIndex: number } => c.galleryIndex !== undefined)
    .map((c) => [c.galleryIndex, c]),
);

/**
 * Alt text for gallery image number `index`.
 *
 * If the image is linked to a known certification:
 *   "eJPT v2 certificate issued by INE Security"
 * If not:
 *   "Certificate 12 of 74" — not ideal, but every image now has a distinct identity
 *   instead of 74 copies of the same sentence.
 */
export const certificationAlt = (index: number): string => {
  const cert = byGalleryIndex.get(index);
  if (!cert) return `Certificate ${index} of ${GALLERY_IMAGE_COUNT}`;
  return `${cert.shortName ?? cert.name} certificate issued by ${cert.issuer}`;
};

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
