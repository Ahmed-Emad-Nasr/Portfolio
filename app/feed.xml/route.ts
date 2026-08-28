/*
 * feed.xml/route.ts
 * Author: Ahmed Emad Nasr
 *
 * RSS feed للـ cases. بيطلع كملف ثابت وقت الـ build.
 *
 * "force-static" مش اختياري هنا: مع output: "export" الـ route handler لازم
 * يبقى static بالكامل، فأي حاجة ديناميكية هتكسر الـ build.
 */

import { caseEvidenceLibrary } from "@/app/core/config/portfolio";
import { absoluteUrl, caseUrl } from "@/app/core/config/site";

export const dynamic = "force-static";

/** أي & أو < في عنوان أو وصف بيكسر الـ XML لو معملتش escape */
const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toRfc822 = (value?: string): string => {
  const parsed = value ? new Date(value) : new Date();
  return (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toUTCString();
};

export function GET() {
  const items = [...caseEvidenceLibrary]
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    })
    .map((item) => {
      const link = caseUrl(item.id);
      const categories = [...(item.tags ?? []), ...(item.tools ?? [])]
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(item.date)}</pubDate>
      <description>${escapeXml(item.description ?? item.title)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ahmed Emad Nasr — SOC &amp; DFIR Cases</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>Incident response reports, DFIR writeups, malware analysis, and threat hunting cases.</description>
    <language>en</language>
    <lastBuildDate>${toRfc822()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
