/* /llms.txt (llmstxt.org): a plain Markdown summary of the site for AI
   assistants, built from the same data as the pages */

import { caseEvidenceLibrary } from "@/data/cases";
import { certifications } from "@/data/certifications";
import { knowledgeEducationItems } from "@/data/experience";
import { skillGroups } from "@/data/skills";
import { blogYoutubePlaylists } from "@/data/youtube";
import { absoluteUrl, caseUrl } from "@/lib/site";
import { CV_PDF_HREF, YOUTUBE_CHANNEL_URL } from "@/lib/shared";
import { SAME_AS, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const current = knowledgeEducationItems.filter(
  (item) => item.kind === "work" && !("endDate" in item && item.endDate),
);
const past = knowledgeEducationItems.filter(
  (item) => item.kind === "work" && "endDate" in item && item.endDate,
);
const education = knowledgeEducationItems.filter((item) => item.kind === "education");

const line = (item: (typeof knowledgeEducationItems)[number]) =>
  `- ${item.tag} — ${item.subTag} (${item.startDate.slice(0, 7)} – ${"endDate" in item && item.endDate ? item.endDate.slice(0, 7) : "present"})`;

const body = `# Ahmed Emad Nasr — Information Security Officer

> Egyptian information security professional (Cairo / Benha) working across governance, risk and compliance (GRC), SOC operations, incident response and digital forensics (DFIR), malware analysis, identity and access management (IAM) and data security. Cybersecurity instructor. Penetration testing at beginner level only (eJPT).

Also known as: Ahmed Emad, 3omda, 0x3omda.

## Contact

- Portfolio: ${SITE_URL}
- CV (HTML): ${absoluteUrl("/cv")}
- CV (PDF): ${absoluteUrl(CV_PDF_HREF)}
- Email: ahmed.em.nasr@gmail.com
- Languages: English

## Profiles

${SAME_AS.map((url) => `- ${url}`).join("\n")}

## Focus areas

${skillGroups.map((group) => `- **${group.label}**: ${group.items.join(", ")}`).join("\n")}

## Current roles

${current.map(line).join("\n")}

## Previous experience

${past.map(line).join("\n")}

## Education & training

${education.map(line).join("\n")}

## Certifications

${certifications.map((cert) => `- ${cert.name} — ${cert.issuer}, ${cert.year}`).join("\n")}

## Pages

- [Home](${absoluteUrl("/")}): the portfolio — who I am, services, selected work and experience
- [About](${absoluteUrl("/")}#about): toolbox, home lab, path, process, contributions (a section of the home page)
- [Gallery](${absoluteUrl("/gallery")}): certificates, events and moments
- [Blog](${absoluteUrl("/blog")}): the case library, ATT&CK coverage, detection rules, videos
- [CV](${absoluteUrl("/cv")})

## Case library (${caseEvidenceLibrary.length} reports)

${caseEvidenceLibrary.map((item) => `- [${item.title}](${caseUrl(item.id)}): ${item.category}, ${item.platform}`).join("\n")}

## Videos

YouTube channel: ${YOUTUBE_CHANNEL_URL}

${blogYoutubePlaylists.map((playlist) => `- [${playlist.title}](${playlist.sourceUrl.split("&")[0]})${playlist.description ? `: ${playlist.description}` : ""}`).join("\n")}

## Optional

- [RSS feed of the blog](${absoluteUrl("/feed.xml")})
- [Sitemap](${absoluteUrl("/sitemap.xml")})
- [security.txt](${absoluteUrl("/.well-known/security.txt")})
`;

export function GET() {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
