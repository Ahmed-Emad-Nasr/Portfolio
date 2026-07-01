"use client";

import { memo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface KanjiDividerProps {
  text?: string;
  reverse?: boolean;
  angle?: number;
}

const DEFAULT_TEXT = "武士道 • 継続は力なり • 改善 • 不撓不屈 • 七転八起";

const KanjiDivider = memo(function KanjiDivider({
  text = DEFAULT_TEXT,
  reverse = false,
  angle = -1.5,
}: KanjiDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? ["-40%", "0%"] : ["0%", "-40%"]
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        height: "clamp(5.2rem, 7vw, 7rem)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        margin: "1.8rem 0",
        zIndex: 20,
        transform: `rotate(${angle}deg) scale(1.1)`,
        backgroundImage:
          "repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 10px, #080808 10px, #080808 20px)",
        backgroundSize: "28px 28px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "var(--main-color)", zIndex: 1 }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "3px", background: "var(--main-color)", zIndex: 1 }} />

      <motion.div
        style={{
          x: prefersReducedMotion ? 0 : x,
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          gap: "4rem",
          paddingInline: "2rem",
          whiteSpace: "nowrap",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 2.8vw, 3.1rem)",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(255, 248, 220, 0.34)",
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 2,
          lineHeight: 1,
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={`${text}-${index}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "1.8rem", whiteSpace: "nowrap" }}
          >
            <span
              style={{
                color: "#e1004f",
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.34em",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                textShadow: "0 0 12px rgba(225, 0, 79, 0.25)",
              }}
            >
              Ahmed Emad Nasr
            </span>
            <span style={{ color: "rgba(255, 248, 220, 0.15)" }}>•</span>
            <span style={{ whiteSpace: "nowrap" }}>{text}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
});

export default KanjiDivider;