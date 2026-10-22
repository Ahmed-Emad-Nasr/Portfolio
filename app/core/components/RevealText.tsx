/**
 * Word-by-word masked reveal for headings.
 * Non-latin strings stay whole (no per-char splitting for JP text).
 *
 * Pure CSS (globals.css, .reveal-word): each word slides up out of its mask
 * from the first paint, staggered 60 ms apart. It used to be framer-motion
 * variants, which rendered the words pushed out of view in the server HTML
 * and only brought them in once React had hydrated — the hero name, the
 * page's largest text, stayed invisible for seconds on a phone (it was the
 * LCP element). No "use client": nothing here needs the browser.
 */
import type { CSSProperties } from "react";

export function RevealText({
  text,
  className,
  style,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const isLatin = /^[\x00-\x7F\s]*$/.test(text);
  const units = isLatin ? text.split(" ") : [text];

  return (
    <Tag className={className} style={style}>
      {/* The animated words are aria-hidden; this is what assistive tech reads
          (aria-label is not allowed on a plain span) */}
      <span className="sr-only">{text}</span>
      {units.map((u, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
          aria-hidden="true"
        >
          <span className="reveal-word inline-block" style={{ "--w": delay + i * 0.06 } as CSSProperties}>
            {u}
            {isLatin && i < units.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
