/*
 * llms.txt/route.ts
 * Author: Ahmed Emad Nasr
 *
 * /llms.txt — the llmstxt.org convention: a plain Markdown summary of the
 * site for AI assistants and AI search (ChatGPT search, Perplexity, Claude,
 * Gemini). They read it instead of parsing a 1 MB single-page app, so when
 * someone asks one of them "who is Ahmed Emad Nasr?" or "Egyptian GRC / SOC
 * analysts", the answer comes from this text.
 *
 * Built from the same config as the pages, so it cannot drift from them.
 * Like feed.xml, "force-static" is required with output: "export".
 */

import { caseEvidenceLibrary } from "@/app/core/config/cases";
import { getAllPosts } from "@/app/core/content/posts";
import { certifications } from "@/app/core/config/certifications";
import { knowledgeEducationItems } from "@/app/core/config/experience";
import { skillGroups } from "@/app/core/config/skills";
import { blogYoutubePlaylists } from "@/app/core/config/youtube";
import { absoluteUrl, caseUrl } from "@/app/core/config/site";
import { CV_PDF_HREF, YOUTUBE_CHANNEL_URL } from "@/app/core/config/shared";
import { SAME_AS, SITE_URL } from "@/app/core/config/seo";

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

Also known as: Ahmed Emad, 3omda, 0x3omda, أحمد عماد نصر.

## Contact

- Portfolio: ${SITE_URL}
- CV (HTML): ${absoluteUrl("/cv")}
- CV (PDF): ${absoluteUrl(CV_PDF_HREF)}
- Email: ahmed.em.nasr@gmail.com
- Languages: Arabic (native), English

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

- [Home](${absoluteUrl("/")}): who I am, services, selected work, experience, credentials
- [Blog](${absoluteUrl("/blog")}): posts, the case library, ATT&CK coverage, detection rules, videos
- [About](${absoluteUrl("/about")}): toolbox, home lab, path, process, contributions
- [CV](${absoluteUrl("/cv")})
${getAllPosts().length ? `
## Posts

${getAllPosts().map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}
` : ""}
## Case library (${caseEvidenceLibrary.length} reports)

${caseEvidenceLibrary.map((item) => `- [${item.title}](${caseUrl(item.id)}): ${item.category}, ${item.platform}`).join("\n")}

## Videos (Arabic)

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
