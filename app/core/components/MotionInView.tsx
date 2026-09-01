"use client";

/*
 * MotionInView.tsx — TRIMMED
 *
 * This file used to export a full `MotionInView` component (variants,
 * viewport animation, the lot) plus `motionVariants` and a re-exported
 * `AnimatePresence`. Nothing uses any of them now: every usage moved to
 * Reveal/RevealGroup (pure CSS, one shared observer — see Reveal.tsx), and
 * the comment already sitting in sensei-art.tsx said so outright: "the
 * MotionInView wrapper was removed from here". The last consumer went away;
 * the file did not.
 *
 * What is genuinely still in use is `MotionProvider` alone, mounted once in
 * layout.tsx to supply framer-motion features to any `m.*` beneath it (its
 * only consumer today: sensei_loader.tsx). The rest is deleted so the file
 * describes the present rather than a previous state.
 */

import React from "react";
import { LazyMotion } from "framer-motion";

/*
 * `domAnimation` was a static import, so its ~25KB were part of the main
 * bundle on every page — including the blog pages, which animate less.
 *
 * LazyMotion accepts a function returning a Promise, so the package loads
 * after first paint instead of delaying it. The m.* components render in
 * their initial state until it arrives, which is exactly what happens today
 * anyway while the bundle loads — the difference is that the content shows
 * sooner.
 *
 * The function lives outside the component deliberately: defined inside, it
 * would be a new reference on every render and LazyMotion would reload.
 */
const loadDomAnimation = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

/** Mount ONCE, near the root. Provides features for every m.* below it. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      {children}
    </LazyMotion>
  );
}
