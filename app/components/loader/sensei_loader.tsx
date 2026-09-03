"use client";

/*
 * sensei_loader.tsx — SOC console boot v2
 * Author: Ahmed Emad Nasr
 *
 * ═══ الفكرة ═══
 *
 * الشاشة دي أول حاجة أي حد بيشوفها، وأغلبهم recruiters. فبدل ما تبقى
 * spinner بيقول "استنى"، بقت أول معلومة عنك: كونسول SOC بيقلع.
 *
 * والقاعدة اللي الملف كله ماشي عليها: **كل رقم على الشاشة دي حقيقي.**
 * مفيش عدّاد وهمي ولا شريط بيتحرك على مؤقّت. لو مفيش مصدر حقيقي
 * للمعلومة، مبتتعرضش.
 *
 * ═══ اللي بيتعرض، ومنين ═══
 *
 *  · الشريط         → حالة الـ DOM + نسبة الصور اللي خلصت تحميل
 *  · الساعة         → وقت الزائر الحقيقي بتوقيت UTC
 *  · سطر CLIENT     → navigator.connection / hardwareConcurrency /
 *                     deviceMemory + الـ tier اللي useDeviceTier حسبه
 *  · سطور الإقلاع   → ثوابت من الـ CV (شوف التعليق تحت)
 *
 * سطر الـ CLIENT هو المفضّل عندي: المتصفح بيدّي المعلومات دي مجاناً،
 * والموقع بيحسبها أصلاً عشان ميزانية الحركة. عرضها على شاشة بورتفوليو
 * أمن معلومات بتقول للزائر "أنا شايف الجهاز اللي بتتفرّج منه" — وده
 * صادق تماماً وفي نفس الوقت الغمزة الصح للمجال.
 *
 * لو حسّيت إنها زيادة، امسح <ClientLine /> وسطر الاستدعاء بتاعها. مفيش
 * حاجة تانية بتعتمد عليها.
 *
 * ═══ حاجة مهمة عن السلوك ═══
 *
 * الشاشة دي **عمرها ما بتأخّر المحتوى**. الـ MAX_VISIBLE_MS سقف مطلق:
 * لو أي صورة علّقت، الشاشة بتتشال والزائر بيكمّل.
 */

import { useEffect, useRef, useState } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import styles from "./sensei_loader.module.css";

/*
 * سطور الإقلاع. كل سطر ليه عتبة: مبيظهرش غير لما التقدّم الحقيقي يعدّيها.
 *
 * القيم دي منسوخة من config/skills.ts و config/certifications.ts و
 * config/cases.ts — **مش مستوردة منهم**.
 *
 * السبب: الملفين دول ٩ كيلوبايت مع بعض، والملف ده client component على
 * المسار الحرج للصفحة الرئيسية. استيرادهم كان هيحزّم الـ ٩ كيلوبايت في
 * bundle كل زائر عشان نقرا سبع سطور.
 *
 * التنازل: لو غيّرت شهادة أو مهارة هناك، غيّرها هنا كمان.
 */
const BOOT_SEQUENCE = [
  { at: 0,  tag: "init", label: "console",      value: "SOC-01 · online" },
  { at: 10, tag: "load", label: "operator",     value: "Ahmed Emad Nasr" },
  { at: 24, tag: "load", label: "role",         value: "SOC / DFIR Engineer" },
  { at: 38, tag: "load", label: "siem stack",   value: "Wazuh · ELK · Splunk" },
  { at: 52, tag: "load", label: "credentials",  value: "eJPT v2 · CCNA · RH124" },
  { at: 66, tag: "sync", label: "case library", value: "38 reports indexed" },
  { at: 80, tag: "sync", label: "att&ck map",   value: "tactics mapped" },
  { at: 94, tag: "ok",   label: "session",      value: "established" },
] as const;

/*
 * كلمة الحالة جنب الشريط. مربوطة بالمرحلة الحقيقية — مش قايمة كلمات
 * بتتقلب على مؤقّت. كل واحدة بتوصف الحاجة اللي المتصفح بيعملها فعلاً
 * عند النسبة دي.
 */
function phaseLabel(progress: number): string {
  if (progress < 35) return "parsing dom";
  if (progress < 99) return "loading media";
  return "ready";
}

/** أقل وقت ظهور — بيمنع ومضة فريم واحد وبس. */
const MIN_VISIBLE_MS = 400;
/** السقف المطلق: عمرنا ما نحبس الزائر، حتى لو مصدر علّق. */
const MAX_VISIBLE_MS = 4000;
/** كل قد إيه نعيد حساب النسبة. ٨ مرات في الثانية كفاية للعين وأرخص من rAF. */
const POLL_MS = 120;

/* ═══ العلامة ═══
 * حروف بلوك ٥ صفوف. مولّدة مش مكتوبة بالإيد — المحاذاة مضمونة.
 * بتختفي تحت 640px، مفيش مساحة ليها هناك. */
const WORDMARK = [
  "███ ███ █ █ ██  ███",
  "  █ █ █ ███ █ █ █ █",
  " ██ █ █ ███ █ █ ███",
  "  █ █ █ █ █ █ █ █ █",
  "███ ███ █ █ ██  █ █",
] as const;

/*
 * النسبة الحقيقية من إشارتين المتصفح بيديهم مجاناً:
 *
 *   · حالة الـ parser — ٣٥٪. "loading" يعني الـ HTML لسه بيتقرا.
 *   · نسبة الصور اللي خلصت — ٦٥٪. دي الحتة اللي بتاخد وقت فعلاً،
 *     وهي كمان اللي حدث `load` بيستناها.
 *
 * الوزن مش عشوائي: الشريط بيمشي بنفس إيقاع الحاجة اللي الزائر مستنيها.
 * ولو الصفحة من الكاش، النسبة بتقفز لـ ١٠٠ على طول والشاشة بتختفي.
 */
function computeProgress(): number {
  const domReady = document.readyState !== "loading" ? 35 : 0;

  const images = document.images;
  if (!images.length) return domReady + 65;

  let complete = 0;
  for (let i = 0; i < images.length; i++) {
    if (images[i].complete) complete++;
  }
  return domReady + Math.round((complete / images.length) * 65);
}

/* ═══ ساعة الجلسة ═══
 *
 * مكوّن منفصل عن قصد: هو الوحيد اللي بيعمل re-render كل ثانية، فلمّا
 * يبقى لوحده الـ re-render ده بيلمس <span> واحد بدل الشاشة كلها.
 *
 * والقيمة الابتدائية "--:--:--" مش تجميل: `new Date()` وقت الـ render
 * بيدي نتيجة مختلفة على السيرفر وعلى المتصفح، وده hydration mismatch
 * مضمون. الوقت الحقيقي بيتكتب في الـ effect بعد الـ mount.
 */
function SessionClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().slice(11, 19));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span className={styles.clock}>{time}Z</span>;
}

/* ═══ بصمة العميل ═══
 *
 * كلها من واجهات المتصفح القياسية. مفيش تتبّع ومفيش حاجة بتتبعت لأي
 * مكان — الأرقام دي بتتحسب في المتصفح، بتتعرض، وبتموت مع الشاشة.
 *
 * deviceMemory و connection موجودين في Chromium بس. اللي مش متاح
 * بيتشال من السطر بدل ما يتعرض "unknown" — سطر ناقص أنضف من سطر
 * بيعترف إنه مش عارف.
 */
function ClientLine({ tier }: { tier: string }) {
  const [facts, setFacts] = useState<string[]>([]);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string };
    };

    const parts: string[] = [];
    const net = nav.connection?.effectiveType;
    if (net) parts.push(net);
    if (nav.hardwareConcurrency) parts.push(`${nav.hardwareConcurrency} cores`);
    if (nav.deviceMemory) parts.push(`${nav.deviceMemory}gb`);
    parts.push(`${window.innerWidth}×${window.innerHeight}`);
    parts.push(`tier:${tier}`);

    setFacts(parts);
  }, [tier]);

  // قبل الـ mount مفيش حاجة تتعرض — نفس الـ markup على السيرفر والمتصفح.
  if (!facts.length) return null;

  return (
    <p className={styles.logLine} data-tag="scan">
      <span className={styles.logTag}>scan</span>
      <span className={styles.logLabel}>client</span>
      <span className={styles.logDots} />
      <span className={styles.logValue}>{facts.join(" · ")}</span>
    </p>
  );
}

/*
 * EXIT_MS must match the transition duration on .loader[data-state="out"]
 * in sensei_loader.module.css. It is the one number the two files share.
 */
const EXIT_MS = 500;
const EXIT_MS_REDUCED = 200;

export default function LoadingScreen() {
  /*
   * "in"  — visible
   * "out" — the CSS exit transition is running
   * null  — unmounted
   *
   * This used to be a single `loading` boolean driven by framer-motion's
   * <AnimatePresence> + <m.div>, purely so the overlay could fade and slide
   * up on the way out. That is one opacity + one translateY on one element.
   *
   * The cost of buying it from framer-motion was not the exit animation, it
   * was <LazyMotion> in layout.tsx: mounted around the entire tree so that
   * `m.*` would work here. The loader renders on every page load, on every
   * device, which meant the motion engine was on the critical path for every
   * phone visitor — during exactly the window LCP and TBT are measured — in
   * order to animate one div leaving the screen.
   *
   * Two compositor properties on a self-removing element do not need a
   * library. The state machine below is the whole replacement.
   */
  const [phase, setPhase] = useState<"in" | "out" | null>("in");
  const [progress, setProgress] = useState(0);
  const tier = useDeviceTier();
  const reduced = tier === "low";

  /*
   * Read through a ref inside the effect so `reduced` flipping after the
   * tier resolves cannot re-run the whole boot sequence.
   *
   * The assignment lives in an effect, not in the render body. Writing
   * `reducedRef.current = reduced` directly during render is what
   * react-hooks/refs flags, and the rule is right: render has to stay pure
   * so React can discard or replay it. An effect runs after commit, which
   * is early enough here — `leave()` is only ever called from the `load`
   * listener or a timer, long after the first commit.
   */
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  // الـ ref بيمنع الشريط يرجع لورا لو صورة جديدة اتضافت وغيّرت المقام.
  // شريط تقدّم بينقص بيبان زي باج حتى لو الرقم صح.
  const peak = useRef(0);

  useEffect(() => {
    const mountedAt = performance.now();
    let minTimer: number | undefined;
    let unmountTimer: number | undefined;

    /* Kick off the CSS exit, then unmount once it has finished. Guarded so a
       late `load` event and the hard stop cannot both schedule an unmount. */
    let leaving = false;
    const leave = () => {
      if (leaving) return;
      leaving = true;
      setPhase("out");
      unmountTimer = window.setTimeout(
        () => setPhase(null),
        reducedRef.current ? EXIT_MS_REDUCED : EXIT_MS,
      );
    };

    const tick = () => {
      const next = Math.max(peak.current, computeProgress());
      peak.current = next;
      setProgress(next);
    };

    const poll = window.setInterval(tick, POLL_MS);
    tick();

    const dismiss = () => {
      // `load` ضرب، يعني كل حاجة خلصت فعلاً — ١٠٠٪ حقيقية مش مجاملة.
      peak.current = 100;
      setProgress(100);

      const elapsed = performance.now() - mountedAt;
      minTimer = window.setTimeout(
        leave,
        Math.max(0, MIN_VISIBLE_MS - elapsed),
      );
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
    }

    // مخرج طوارئ — من غيره صورة واحدة معلّقة بتحبس الزائر للأبد.
    const hardStop = window.setTimeout(leave, MAX_VISIBLE_MS);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener("load", dismiss);
      if (minTimer !== undefined) window.clearTimeout(minTimer);
      if (unmountTimer !== undefined) window.clearTimeout(unmountTimer);
      window.clearTimeout(hardStop);
    };
  }, []);

  const visibleLines = BOOT_SEQUENCE.filter((line) => progress >= line.at);
  const clamped = Math.min(100, progress);
  const pct = String(clamped).padStart(3, "0");

  if (phase === null) return null;

  return (
    <div
      className={styles.loader}
      /* The exit is a CSS transition keyed on this attribute — see
         .loader[data-state="out"] in the module. data-reduced picks the
         opacity-only variant on low-tier devices. */
      data-state={phase}
      data-reduced={reduced ? "true" : undefined}
      role="status"
      /* aria-live كان "polite" حوالين ticker بيغيّر النص كل ٣٥٠ms —
         قارئ الشاشة كان هيقرا ست سطور إقلاع قبل ما الزائر يوصل لأي
         محتوى. الـ overlay بيعرّف نفسه مرة واحدة بـ aria-label. */
      aria-live="off"
      aria-label="Loading"
    >
      {/* طبقات بتغطي الشاشة كلها. زخرفة بحتة — قواعد الـ tier في
          globals.css بتشيلها على الأجهزة الضعيفة. */}
      {!reduced && (
        <>
          <div className={styles.speedLines} data-decorative="true" aria-hidden="true" />
          <div className={styles.neuralGrid} data-decorative="true" aria-hidden="true" />
          <div className={styles.scanlines} data-decorative="true" aria-hidden="true" />
        </>
      )}

      <div className={styles.cornerTopLeft} aria-hidden="true" />
      <div className={styles.cornerTopRight} aria-hidden="true" />
      <div className={styles.cornerBottomLeft} aria-hidden="true" />
      <div className={styles.cornerBottomRight} aria-hidden="true" />

      {/* ── نافذة الكونسول ────────────────────────────────────── */}
      <div className={styles.console} aria-hidden="true">
        {/* شريط العنوان */}
        <div className={styles.consoleBar}>
          <span className={styles.consoleDots}>
            <i /><i /><i />
          </span>
          <span className={styles.consolePath}>3omda@soc-01: ~/portfolio</span>
          <SessionClock />
          <span className={styles.consoleBadge} lang="ja">師</span>
        </div>

        {/* العلامة */}
        <div className={styles.wordmark}>
          {WORDMARK.map((row, i) => (
            <span key={i} className={styles.wordmarkRow}>{row}</span>
          ))}
          <span className={styles.wordmarkTag} lang="ja">セキュリティ・アナリスト</span>
        </div>

        {/* السجل */}
        <div className={styles.consoleBody}>
          {visibleLines.map((line) => (
            <p key={line.label} className={styles.logLine} data-tag={line.tag}>
              <span className={styles.logTag}>{line.tag}</span>
              <span className={styles.logLabel}>{line.label}</span>
              <span className={styles.logDots} />
              <span className={styles.logValue}>{line.value}</span>
            </p>
          ))}

          {progress >= 45 && <ClientLine tier={tier} />}

          {progress < 100 && (
            <p className={styles.logLine} data-tag="run">
              <span className={styles.logTag}>run</span>
              <span className={styles.logCaret}>▍</span>
            </p>
          )}
        </div>

        {/* ── الشريط ───────────────────────────────────────────
            الجزء المتحرك transform: scaleX() — خاصية compositor،
            يعني مفيش layout ولا paint في كل تحديث. الشبكة اللي
            بتقسّمه لبلوكات طبقة gradient ثابتة فوقه. */}
        <div className={styles.progressWrap}>
          <span className={styles.progressPhase}>{phaseLabel(clamped)}</span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${clamped / 100})` }}
            />
            <div className={styles.progressGrid} />
          </div>
          <span className={styles.progressPct}>{pct}%</span>
        </div>
      </div>

      <div className={styles.sideLabelLeft}>SEN-001</div>
      <div className={styles.sideLabelRight} lang="ja">武士道</div>
    </div>
  );
}
