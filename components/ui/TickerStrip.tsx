"use client";

import type { CSSProperties } from "react";

const DEFAULT_ITEMS = ["統治", "防御", "検知", "対応", "報告", "EVIDENCE OVER CLAIMS"];

export default function TickerStrip({
  items = DEFAULT_ITEMS,
  reverse = false,
}: {
  items?: string[];
  reverse?: boolean;
}) {
  const loop = [...items, ...items];
  return (
    <div className="ticker-strip relative z-20 my-6 flex h-14 w-full items-center overflow-hidden border-y border-foreground/10 bg-background/70 backdrop-blur-sm md:h-16">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
      <div
        className="ticker-track"
        style={{ animationDirection: reverse ? "reverse" : "normal" } as CSSProperties}
        aria-hidden="true"
      >
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-8 pr-8">
            <span className={/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(item) ? "brush-jp text-lg leading-none text-foreground/65" : "font-mono text-[0.6875rem] font-bold uppercase tracking-[0.35em] text-foreground/65"} lang="ja">
              {item}
            </span>
            <span className="inline-block h-1 w-1 rotate-45 bg-primary/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
