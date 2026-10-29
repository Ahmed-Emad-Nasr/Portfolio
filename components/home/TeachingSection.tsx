/*
 * TeachingSection — the diploma curriculum module by module, and where it
 * was taught with the results. Server Component.
 */

import { ArrowUpRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { CounterBadge, KanjiWatermark, cardSurface, chipNeutral, chipTertiary } from "@/components/ui/kit";
import { DIPLOMA, TEACHING_ROLES, TEACHING_STATS } from "@/data/teaching";
import ScrambleText from "@/components/ui/ScrambleText";
import BilingualNote from "@/components/ui/BilingualNote";

const TEACHING_AR: Record<string, string> = {
  "AMIT Learning": "تدريب أكثر من 300 طالب في مسارات الشبكات وLinux وSecurity+ ومقررات SANS SEC450 / SEC504 مع معامل عملية في SOC وPentesting وIAM وGRC، وتدريس إدارة أنظمة Red Hat I & II بنسبة اجتياز 100%.",
  "National Telecommunication Institute (NTI)": "تدريس أكثر من 42 متدرباً في المعهد القومي للاتصالات (NTI) عبر أكثر من 120 ساعة معملية تطبيقية في Linux والشبكات وأساسيات SOC واختبار الاختراق.",
  "Google Developer Groups (GDG)": "تقديم أكثر من 35 محاضرة وجلسة عملية لأكثر من 120 طالباً، وتصميم أكثر من 10 تحديات CTF، والحصول على المركز الأول بين 250 محاضراً.",
  "IEEE": "تدريب أكثر من 5 فرق هندسية (20+ طالباً) على البرمجة بلغتي C وPython لبناء وبرمجة سيارات روبوتية ذاتية القيادة باستخدام Arduino.",
  "YouTube — @AhmedEmad-0x3omda": "قناة تعليمية باللغة العربية لشرح معامل الأمن السيبراني وإعداد Wazuh SIEM وتحليل البرمجيات الخبيثة وحلول TryHackMe (أكثر من 500 مشترك و60,000+ مشاهدة).",
};

export default function TeachingSection() {
  return (
    <section
      id="teaching"
      aria-labelledby="teaching-title"
      className="relative py-24 md:py-32 px-6 md:px-20 bg-background overflow-hidden"
    >
      <KanjiWatermark chars="指導" side="left" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ─── Header ─── */}
        <FadeIn
          x={-32}
          y={0}
          duration={0.7}
          className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-[2px] bg-primary" aria-hidden="true" />
              <span className="text-primary-ink text-[0.6875rem] font-mono font-bold tracking-[0.35em] uppercase">
                <ScrambleText text="Teaching // Passing it on" />
              </span>
              <span className="jp-eyebrow text-[0.6875rem] text-foreground/30 uppercase" lang="ja" aria-hidden="true" data-jp="指導" />
            </div>
            <h2
              id="teaching-title"
              className="font-display title-fit [--title-n:8] font-black tracking-tighter uppercase leading-[0.85]"
            >
              <span className="text-foreground">Pass it</span> <br />
              <span className="text-primary italic">Forward.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/60 font-light leading-relaxed">
              Explaining an attack to a room of forty is a harder test than running it once. The curriculum I wrote,
              and the rooms I taught it in.
            </p>
          </div>
          <CounterBadge value={`${DIPLOMA.hours}h`} top="Curriculum" bottom="Written" />
        </FadeIn>

        {/* ─── Headline numbers ─── */}
        <FadeIn className="mb-10 md:mb-12">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10">
            {TEACHING_STATS.map((s) => (
              <div key={s.label} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 sm:px-6 py-5 bg-background min-w-0">
                <dt className="order-2 flex flex-col min-w-0">
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">{s.label}</span>
                  <span className="jp-eyebrow text-[0.5625rem] text-foreground/25" lang="ja" aria-hidden="true" data-jp={s.japanese} />
                </dt>
                <dd className="order-1 font-mono text-xl md:text-2xl font-black tabular-nums text-accent">{s.value}</dd>
              </div>
            ))}
          </dl>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 lg:gap-10 items-start">
          {/* ─── The diploma: one path, module by module ─── */}
          <FadeIn className={`${cardSurface} p-7 md:p-9`}>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-primary/40 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary" aria-hidden="true" />

            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">
                Curriculum // {DIPLOMA.hours} hours
              </span>
              <span className="jp-eyebrow text-[0.625rem] text-foreground/30" lang="ja" aria-hidden="true" data-jp={DIPLOMA.japanese} />
            </div>
            <h3 className="mt-5 font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-[0.95]">
              {DIPLOMA.title}
            </h3>
            <p className="mt-4 text-sm md:text-base text-foreground/60 font-light leading-relaxed">{DIPLOMA.summary}</p>

            {/* The path: numbered stops on a red rail */}
            <ol className="relative mt-8 border-l border-primary/40 ml-[11px]">
              {DIPLOMA.modules.map((m) => (
                <li key={m.n} className="group/mod relative pl-7 py-3">
                  <span
                    className="absolute -left-[12px] top-1/2 -translate-y-1/2 grid place-items-center w-[23px] h-[23px] bg-surface border border-primary/60 font-mono text-[0.5625rem] font-bold text-primary-ink group-hover/mod:bg-primary group-hover/mod:text-white transition-colors"
                    aria-hidden="true"
                  >
                    {m.n}
                  </span>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm md:text-[0.9375rem] text-foreground/85">
                      <span className="sr-only">Module {m.n}: </span>
                      {m.title}
                    </span>
                    <span className="shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-foreground/60">
                      {m.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 pt-6 border-t border-foreground/10">
              <p className="mb-3 font-mono text-[0.5625rem] uppercase tracking-[0.25em] text-foreground/60">
                Every session ends with
              </p>
              <ul className="flex flex-wrap gap-2">
                {DIPLOMA.format.map((f) => (
                  <li key={f} className={chipNeutral}>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <BilingualNote label="منهج الدبلومة // 160 ساعة">
              منهج تدريبي متكامل من تأسيسي الشبكات وأنظمة Linux وWindows مروراً بـ Security+ وتقنيات الهجوم وصولاً إلى SANS SEC450 وإدارة أنظمة SIEM (Splunk &amp; QRadar) ومشاريع التخرج العملية.
            </BilingualNote>
          </FadeIn>

          {/* ─── Where it was taught ─── */}
          <div className="border-t border-foreground/10">
            {TEACHING_ROLES.map((r, i) => (
              <FadeIn key={r.org} delay={i * 0.05} y={16} duration={0.5}>
                <article className="group py-6 border-b border-foreground/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg md:text-xl font-black uppercase tracking-tight leading-tight">
                        {r.link ? (
                          <a
                            href={r.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1.5 hover:text-primary transition-colors duration-300"
                          >
                            {r.org}
                            <ArrowUpRight size={14} className="mt-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                          </a>
                        ) : (
                          r.org
                        )}
                      </h3>
                      <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-primary-ink">{r.role}</p>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.25em] px-2.5 py-1 border ${
                        r.period === "Now"
                          ? "border-primary/40 text-primary-ink bg-primary/[0.06]"
                          : "border-foreground/10 text-foreground/60"
                      }`}
                    >
                      {r.period}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-foreground/60 font-light leading-relaxed">{r.topics}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {r.results.map((x) => (
                      <li key={x} className={chipTertiary}>
                        {x}
                      </li>
                    ))}
                  </ul>
                  <BilingualNote label="الأثر التدريبي // AR">
                    {TEACHING_AR[r.org] ?? "تدريب تقني تطبيقي يجمع بين الشرح النظري والمعامل العملية وتقييم الأداء."}
                  </BilingualNote>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
