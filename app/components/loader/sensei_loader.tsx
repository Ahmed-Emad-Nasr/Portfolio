"use client";

/*
 * sensei_loader.tsx — نسخة الموبايل
 *
 * ═══ المشكلتين اللي كانوا هنا ═══
 *
 * 1) كان بيستنى حدث `load` بتاع الـ window.
 *    `load` مبيضربش غير لما **كل** المصادر تخلص: كل الصور (بما فيها اللي
 *    تحت الطية)، كل الخطوط، كل ملف JS. على تليفون على شبكة متوسطة ده بسهولة
 *    3–5 ثواني والشاشة سودا. اللي محتاجينه هو "المحتوى الأساسي اتعرض"،
 *    وده `DOMContentLoaded` — بيضرب أبكر بكتير.
 *
 * 2) كان بيستورد framer-motion (AnimatePresence + m) عشان انيميشن خروج واحد.
 *    ده بيحط محرّك الأنيميشن على المسار الحرج للصفحة الرئيسية عشان fade
 *    ممكن يتعمل بـ CSS transition ببلاش. دلوقتي صفر جافاسكريبت أنيميشن هنا.
 *
 * ═══ وعلى التليفون خصوصاً ═══
 *
 * الـ CSS بيخفي الـ overlay بالكامل على html[data-tier="low"]، والسكربت في
 * <head> بيحدّد الـ tier قبل أول paint. يعني زائر الموبايل **عمره ما يشوف
 * الشاشة السودا** — أول paint هو الـ hero نفسه. ده أكبر مكسب في الـ FCP
 * والـ Speed Index في الملف كله.
 *
 * الـ overlay لسه بيترندر في الـ HTML (نفس markup السيرفر والمتصفح، مفيش
 * hydration mismatch) — الـ CSS بس هو اللي بيقرر يوريه ولا لأ.
 */

import { useEffect, useState } from "react";
import { useDeviceTier } from "@/app/core/hooks/useDeviceTier";
import styles from "./sensei_loader.module.css";

const BOOT_LINES = [
  "INITIALIZING SYSTEMS",
  "LOADING BUSHIDO PROTOCOL",
  "CALIBRATING DRIFT ANGLE",
  "ENGINE CHECK — ALL CLEAR",
  "BOOST PRESSURE NOMINAL",
  "SENSEI READY",
] as const;

/** أقل وقت ظهور — بيمنع ومضة فريم واحد وبس. */
const MIN_VISIBLE_MS = 250;
/** السقف المطلق: عمرنا ما نحبس الزائر، حتى لو مصدر علّق. */
const MAX_VISIBLE_MS = 1500;
/** لازم يساوي مدة الـ transition في .leaving داخل الـ CSS. */
const EXIT_MS = 420;

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");
  const [currentLine, setCurrentLine] = useState(0);
  const tier = useDeviceTier();
  const reduced = tier === "low";

  useEffect(() => {
    const mountedAt = performance.now();
    let exitTimer: number | undefined;
    let minTimer: number | undefined;

    const start = () => {
      const elapsed = performance.now() - mountedAt;
      minTimer = window.setTimeout(() => {
        setPhase("leaving");
        exitTimer = window.setTimeout(() => setPhase("gone"), EXIT_MS);
      }, Math.max(0, MIN_VISIBLE_MS - elapsed));
    };

    /*
     * `readyState === "loading"` معناه إن الـ parser لسه شغّال.
     * أي حاجة غير كده ("interactive" أو "complete") معناها إن الـ DOM جاهز
     * والمحتوى اللي وراه اتعرض — مفيش سبب نستنى الصور اللي تحت الطية.
     */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }

    // مخرج طوارئ — القديم كان ممكن يفضل معلّق للأبد لو `load` معضربش.
    const hardStop = window.setTimeout(() => setPhase("gone"), MAX_VISIBLE_MS);

    return () => {
      document.removeEventListener("DOMContentLoaded", start);
      if (minTimer !== undefined) window.clearTimeout(minTimer);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      window.clearTimeout(hardStop);
    };
  }, []);

  // شريط الإقلاع: شغل من غير فايدة بعد ما يختفي، ومتخطّى على الأجهزة الضعيفة.
  useEffect(() => {
    if (phase !== "visible" || reduced) return;
    const id = window.setInterval(
      () => setCurrentLine((prev) => (prev + 1) % BOOT_LINES.length),
      350,
    );
    return () => window.clearInterval(id);
  }, [phase, reduced]);

  if (phase === "gone") return null;

  return (
    <div
      className={`${styles.loader} ${phase === "leaving" ? styles.leaving : ""}`}
      role="status"
      /* aria-live كان "polite" حوالين ticker بيغيّر النص كل 350ms — قارئ
         الشاشة كان هيقرا ست سطور إقلاع قبل ما الزائر يوصل لأي محتوى.
         الـ overlay بيعرّف نفسه مرة واحدة بـ aria-label. */
      aria-live="off"
      aria-label="Loading"
    >
      {/* تلات طبقات بتغطي الشاشة كلها. زخرفة بحتة — قواعد الـ tier في
          الـ CSS بتشيلها على الأجهزة الضعيفة. */}
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

      <div className={styles.emblem} aria-hidden="true">
        {/* كانت تلات حلقات framer-motion لا نهائية منفصلة (دوران، نبض حجم،
            نبض شفافية) كل واحدة اشتراك animation frame لوحدها. بقت دوران
            واحد بـ CSS — نفس الفكرة، صفر جافاسكريبت. */}
        <div className={styles.outerRing} data-decorative="true" />
        <div className={styles.innerRing} />
        <div className={styles.symbolWrap}>
          <span className={styles.symbol}>師</span>
        </div>
      </div>

      <div className={styles.bootText} aria-hidden="true">
        <div className={styles.bootLineRow}>
          <div className={styles.bootLine} />
          <span className={styles.bootLineText}>
            {reduced ? "LOADING" : BOOT_LINES[currentLine]}
          </span>
          <div className={styles.bootLine} />
        </div>
        {/* كان <h2>. الـ overlay ده بيتشحن جوه الـ HTML المصدّر، يعني
            "The Samurai Way." كان أول عنوان يقابل أي crawler على كل صفحة —
            فوق العنوان الحقيقي. ده زخرفة، فبقى <p>. */}
        <p className={styles.title}>
          The Samurai <span className={styles.titleAccent}>Way.</span>
        </p>
      </div>

      <div className={styles.progressBar} aria-hidden="true">
        <div className={styles.progressFill} data-decorative="true" />
      </div>

      <div className={styles.sideLabelLeft}>SEN-001</div>
      <div className={styles.sideLabelRight}>武士道</div>
    </div>
  );
}
