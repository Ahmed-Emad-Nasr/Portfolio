/* StartHere — three reports to read first */

import PageLink from "@/components/ui/PageLink";
import { startHere } from "@/data/start-here";
import { caseEvidenceLibrary } from "@/data/cases";
import { Eyebrow } from "@/components/ui/kit";
import BilingualNote from "@/components/ui/BilingualNote";

const KNOWN_IDS = new Set(caseEvidenceLibrary.map((item) => item.id));
const ENTRIES = startHere.filter((entry) => KNOWN_IDS.has(entry.id));

const START_HERE_AR: Record<string, string> = {
  "3omda-custom-detection-rules": "حزمة تضم 52 قاعدة كشف مخصصة لـ Wazuh SIEM مرتبطة بتكتيكات MITRE ATT&CK ومعايير PCI DSS وGDPR لرصد هجمات Brute Force والـ Ransomware وDNS Tunneling.",
  "data-exfiltration-investigation": "تحقيق جنائي رقمي شامل للذاكرة العشوائية (Volatility): إثبات تسريب الملفات عبر USB من سجل الأوامر، واستخراج وكسر بصمات NTLM، وبناء الخط الزمني الكامل للاختراق.",
  "malware-analysis-wannacry": "تحليل ثابت وديناميكي متكامل لنسخة معدلة من فدية WannaCry داخل مختبر معزول — يشمل مؤشرات الاختراق (IOCs) و3 قواعد YARA وربط ATT&CK وخطة الاحتواء.",
};

export default function StartHere({
  note = "Three reports to start with — detection engineering, a full DFIR investigation and a malware teardown. The full library is below.",
  headingLevel: H = "h2",
}: {
  note?: string;
  /** h3 when it sits inside another section (the home page's blog teaser) */
  headingLevel?: "h2" | "h3";
} = {}) {
  if (ENTRIES.length === 0) return null;

  return (
    <section id="start-here" className="relative mb-20" aria-labelledby="start-here-title">
      <Eyebrow japanese="入門">Short on time</Eyebrow>
      <H id="start-here-title" className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground mb-3">
        Start <span className="text-primary italic">here.</span>
      </H>
      <p className="mb-10 max-w-2xl text-foreground/60 font-light leading-relaxed">{note}</p>
      <ol className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ENTRIES.map((entry, idx) => (
          <li key={entry.id}>
            <PageLink
              href={`/blog/${entry.id}`}
              className="relative spotlight block h-full bg-surface/60 border border-foreground/5 p-7 hover:border-primary/40 transition-colors duration-500 group"
            >
              <div className="font-mono text-5xl font-black text-foreground/[0.06] absolute top-4 right-5 select-none" aria-hidden="true" data-deco={String(idx + 1).padStart(2, "0")} />
              <div className="font-mono text-[0.625rem] text-primary-ink tracking-[0.3em] uppercase mb-3">
                {String(idx + 1).padStart(2, "0")} • {entry.minutes} min
              </div>
              <h3 className="font-display text-xl font-black uppercase text-foreground mb-3 group-hover:text-primary-ink transition-colors duration-300">
                {entry.label}
              </h3>
              <p className="text-sm text-foreground/60 font-light leading-relaxed">{entry.why}</p>
              <BilingualNote label="تقرير مرشّح للبدء // AR">
                {START_HERE_AR[entry.id] ?? "تقرير أساسي يوضح منهجية التحقيق والأدلة الفنية والنتيجة النهائية."}
              </BilingualNote>
            </PageLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
