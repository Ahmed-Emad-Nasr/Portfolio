"use client";

/*
 * sensei_loader.tsx — SOC console boot v2
 * Author: Ahmed Emad Nasr
 *
 * ═══ The idea ═══
 *
 * This screen is the first thing anyone sees, and most of them are recruiters. So instead of being
 * a spinner that says "wait", it became the first fact about you: a SOC console booting up.
 *
 * And the rule the whole file follows: **every number on this screen is real.**
 * No fake counter and no bar moving on a timer. If there's no real source
 * for a piece of information, it isn't shown.
 *
 * ═══ What's shown, and where it comes from ═══
 *
 *  · The bar          → DOM state + the share of images that have finished loading
 *  · The clock        → the visitor's real time in UTC
 *  · CLIENT line      → navigator.connection / hardwareConcurrency /
 *                       deviceMemory + the tier computed by useDeviceTier
 *  · Boot lines       → constants from the CV (see the comment below)
 *
 * The CLIENT line is my favourite: the browser provides this information for free,
 * and the site already computes it for the motion budget. Showing it on the boot screen of a security
 * portfolio tells the visitor "I can see the device you're browsing from" — which is
 * completely honest and at the same time the right wink for the field.
 *
 * If it feels like too much, delete <ClientLine /> and the line that renders it. Nothing
 * else depends on it.
 *
 * ═══ An important note about behaviour ═══
 *
 * This screen **never delays the content**. MAX_VISIBLE_MS is a hard ceiling:
 * if any image hangs, the screen is removed and the visitor carries on.
 */

import { useEffect, useRef, useState } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import styles from "./sensei_loader.module.css";

/*
 * Boot lines. Each line has a threshold: it only appears once real progress passes it.
 *
 * These values are copied from config/skills.ts, config/certifications.ts and
 * config/cases.ts — **not imported from them**.
 *
 * Reason: those files are 9 KB together, and this file is a client component on
 * the home page's critical path. Importing them would bundle those 9 KB into
 * every visitor's bundle just to read seven lines.
 *
 * The trade-off: if you change a certification or skill there, change it here too.
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
 * The status word next to the bar. Tied to the real phase — not a list of words
 * cycling on a timer. Each one describes what the browser is actually doing
 * at that percentage.
 */
function phaseLabel(progress: number): string {
  if (progress < 35) return "parsing dom";
  if (progress < 99) return "loading media";
  return "ready";
}

/** Minimum display time — prevents a single-frame flash. */
const MIN_VISIBLE_MS = 400;
/** Hard ceiling: we never trap the visitor, even if a resource hangs. */
const MAX_VISIBLE_MS = 4000;
/** How often to recompute the percentage. 8 times a second is enough for the eye and cheaper than rAF. */
const POLL_MS = 120;

/* ═══ The mark ═══
 * 5-row block letters. Generated, not hand-written — alignment is guaranteed.
 * Hidden below 640px, there's no room for it there. */
const WORDMARK = [
  "███ ███ █ █ ██  ███",
  "  █ █ █ ███ █ █ █ █",
  " ██ █ █ ███ █ █ ███",
  "  █ █ █ █ █ █ █ █ █",
  "███ ███ █ █ ██  █ █",
] as const;

/*
 * The real percentage from two signals the browser gives for free:
 *
 *   · Parser state — 35%. "loading" means the HTML is still being parsed.
 *   · Share of images finished — 65%. This is the part that actually takes time,
 *     and it's also what the `load` event waits for.
 *
 * The weighting isn't arbitrary: the bar moves at the same pace as the thing the visitor is waiting for.
 * And if the page comes from cache, the percentage jumps straight to 100 and the screen disappears.
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

/* ═══ Session clock ═══
 *
 * A separate component on purpose: it's the only one that re-renders every second, so being
 * on its own, that re-render touches a single <span> instead of the whole screen.
 *
 * And the initial "--:--:--" value isn't cosmetic: `new Date()` at render time
 * gives a different result on the server and in the browser, which is a guaranteed
 * hydration mismatch. The real time is written in the effect after mount.
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

/* ═══ Client fingerprint ═══
 *
 * All from standard browser APIs. No tracking and nothing is sent
 * anywhere — these numbers are computed in the browser, displayed, and die with the screen.
 *
 * deviceMemory and connection exist in Chromium only. Whatever isn't available
 * is dropped from the line instead of showing "unknown" — a shorter line is cleaner than a line
 * admitting it doesn't know.
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

  // Before mount nothing is shown — same markup on the server and in the browser.
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

  // The ref prevents the bar from going backwards if a new image is added and changes the denominator.
  // A progress bar that decreases looks like a bug even if the number is correct.
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
      // `load` fired, so everything has actually finished — a real 100%, not a courtesy one.
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

    // Emergency exit — without it a single hanging image would trap the visitor forever.
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
    <>
      {/* The only announcement. The loader itself is aria-hidden, so this is what gets read:
          one sentence, once. aria-live="polite" means the reader
          waits until it finishes what it's saying instead of interrupting. */}
      <p className="sr-only" role="status">
        {phase === "out" ? "Site loaded" : "Loading site"}
      </p>
      <div
      className={styles.loader}
      /*
       * ── Accessibility ─────────────────────────────────────────────────
       *
       * The loader covers the whole screen and contains a lot of decoration: SEN-001, 武士道, the
       * logo lines, the console path, the clock. The screen reader used to read all of that out
       * loud before the user reached any real content.
       *
       * aria-hidden removes the decoration from the accessibility tree without touching the visuals,
       * and the only line that gets read now lives in the element below — one sentence
       * instead of a whole screen.
       */
      aria-hidden="true"
      /* The exit is a CSS transition keyed on this attribute — see
         .loader[data-state="out"] in the module. data-reduced picks the
         opacity-only variant on low-tier devices. */
      data-state={phase}
      data-reduced={reduced ? "true" : undefined}
      role="status"
      /* aria-live used to be "polite" around a ticker that changed its text every 350ms —
         the screen reader would have read six boot lines before the visitor reached any
         content. The overlay identifies itself once via aria-label. */
      aria-live="off"
      aria-label="Loading"
    >
      {/* Full-screen layers. Pure decoration — the tier rules in
          globals.css remove them on weak devices. */}
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

      {/* ── Console window ────────────────────────────────────── */}
      <div className={styles.console} aria-hidden="true">
        {/* Title bar */}
        <div className={styles.consoleBar}>
          <span className={styles.consoleDots}>
            <i /><i /><i />
          </span>
          <span className={styles.consolePath}>3omda@soc-01: ~/portfolio</span>
          <SessionClock />
          <span className={styles.consoleBadge} lang="ja">師</span>
        </div>

        {/* The mark */}
        <div className={styles.wordmark}>
          {WORDMARK.map((row, i) => (
            <span key={i} className={styles.wordmarkRow}>{row}</span>
          ))}
          <span className={styles.wordmarkTag} lang="ja">セキュリティ・アナリスト</span>
        </div>

        {/* The log */}
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

        {/* ── The bar ──────────────────────────────────────────
            The moving part is transform: scaleX() — a compositor property,
            so no layout or paint on each update. The grid that
            splits it into blocks is a static gradient layer on top. */}
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
    </>
  );
}
