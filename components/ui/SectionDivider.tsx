"use client";

import { m as motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

interface SectionDividerProps {
  text?: string;
  reverse?: boolean;
  angle?: number;
}

/* CSS scroll-driven animations (animation-timeline: view()) run on the
   compositor: the drift costs no JavaScript at all while scrolling. Chrome,
   Edge and Safari 26+ have them; elsewhere the framer-motion version takes
   over after mount. */
const cssScrollTimeline = () =>
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("animation-timeline: view()");

/* The framer-motion fallback: same motion, driven from JavaScript */
function ScriptDrift({ target, reverse, children }: { target: RefObject<HTMLDivElement | null>; reverse: boolean; children: ReactNode }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reverse ? ["-25%", "0%"] : ["0%", "-25%"]);
  return (
    <motion.div style={{ x }} className="relative flex items-center gap-10 whitespace-nowrap select-none">
      {children}
    </motion.div>
  );
}

/**
 * Noren divider — a calm black banner with a red katana edge.
 * Brush Japanese drifts with page scroll (as in Sensei-Dev); small red
 * diamonds mark the 3OMDA seal. Decoration only, so the whole banner is
 * hidden from assistive tech.
 */
export default function SectionDivider({
  text = "武士道 • 継続は力なり • 改善 • 不撓不屈 • 七転八起",
  reverse = false,
  angle = -1,
}: SectionDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  /* Server and first client render use the CSS version (identical markup);
     a browser without scroll timelines switches to the script version */
  const [script, setScript] = useState(false);
  useEffect(() => {
    if (!cssScrollTimeline()) setScript(true);
  }, []);

  const items = [...Array(8)].map((_, i) => (
    <span key={i} className="flex items-center gap-10">
      <span className="brush-jp text-2xl md:text-3xl text-foreground/35" lang="ja" data-jp={text} />
      <span className="flex items-center gap-2.5">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/80" />
        <span className="font-mono text-[0.625rem] font-bold tracking-[0.45em] text-primary-ink">3OMDA</span>
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-primary/80" />
      </span>
    </span>
  ));

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="divider-frame relative z-20 flex h-20 md:h-24 w-full items-center overflow-hidden border-y border-foreground/10 bg-background/70 backdrop-blur-sm"
      style={{
        transform: `rotate(${angle}deg) scale(1.05)`,
        margin: "2.5rem 0",
      }}
    >
      {/* Katana edges */}
      <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {script ? (
        <ScriptDrift target={containerRef} reverse={reverse}>
          {items}
        </ScriptDrift>
      ) : (
        <div className={`divider-drift relative flex items-center gap-10 whitespace-nowrap select-none ${reverse ? "divider-drift-reverse" : ""}`}>
          {items}
        </div>
      )}
    </div>
  );
}
