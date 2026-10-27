"use client";

/*
 * PostToc — the post's headings. Desktop: a sticky column that highlights
 * the section being read. Phones and tablets: a collapsible "On this page"
 * box above the article (the same list, rendered by PostArticle with
 * variant="inline").
 */

import { useEffect, useState } from "react";
import type { PostHeading } from "@/app/core/content/posts";
import { scrollToElement } from "@/app/core/utils/scroll";

export default function PostToc({ headings, label, variant = "sticky" }: { headings: PostHeading[]; label: string; variant?: "sticky" | "inline" }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (variant !== "sticky") return;
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    /* The active heading is the last one that has scrolled past the top
       third of the screen */
    const io = new IntersectionObserver(
      () => {
        const line = window.innerHeight * 0.33;
        let current: string | null = els[0].id;
        for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
        setActive(current);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      const line = window.innerHeight * 0.33;
      let current: string | null = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [headings, variant]);

  if (headings.length < 2) return null;

  const list = (
    <ol className="flex flex-col gap-1 border-s border-foreground/10">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={(e) => {
              const el = document.getElementById(h.id);
              if (!el) return;
              e.preventDefault();
              history.replaceState(null, "", `#${h.id}`);
              scrollToElement(el);
            }}
            aria-current={active === h.id ? "location" : undefined}
            className={`-ms-px block border-s-2 py-1.5 text-[0.8125rem] leading-snug transition-colors duration-300 ${h.depth === 3 ? "ps-6" : "ps-4"} ${
              active === h.id ? "border-primary text-foreground" : "border-transparent text-foreground/65 hover:text-foreground"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "inline") {
    return (
      <details className="toc-inline group/toc mb-10 border border-foreground/10 bg-surface/50 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.25em] text-primary-ink">
          {label}
          <span className="text-foreground/50 transition-transform duration-300 group-open/toc:rotate-45" aria-hidden="true">+</span>
        </summary>
        <nav aria-label={label} className="px-5 pb-5">{list}</nav>
      </details>
    );
  }

  return (
    <nav aria-label={label} className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto" data-lenis-prevent="">
      <p className="mb-4 font-mono text-[0.625rem] font-bold uppercase tracking-[0.3em] text-primary-ink">{label}</p>
      {list}
    </nav>
  );
}
