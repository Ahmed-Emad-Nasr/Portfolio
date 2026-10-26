"use client";

/*
 * Comments — the post's Giscus thread (core/config/comments.ts). Nothing is
 * loaded from giscus.app or GitHub until the reader asks for it, the same
 * rule the site follows for YouTube. The thread follows the site theme.
 */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { MessageSquare } from "lucide-react";
import type { GiscusConfig } from "@/app/core/config/comments";

export default function Comments({ config, term, lang }: { config: GiscusConfig; term: string; lang: "en" | "ar" }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "transparent_dark";

  useEffect(() => {
    if (!open || !box.current || box.current.childElementCount) return;
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    const attrs: Record<string, string> = {
      "data-repo": config.repo,
      "data-repo-id": config.repoId,
      "data-category": config.category,
      "data-category-id": config.categoryId,
      "data-mapping": "specific",
      "data-term": term,
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": theme,
      "data-lang": lang,
      "data-loading": "lazy",
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    box.current.appendChild(s);
  }, [open, config, term, lang, theme]);

  /* Theme switches after the thread has loaded */
  useEffect(() => {
    const frame = box.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, "https://giscus.app");
  }, [theme]);

  return (
    <section aria-labelledby="comments-title" className="mt-16 border-t border-foreground/10 pt-10">
      <h2 id="comments-title" className="mb-6 flex items-center gap-3 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-primary-ink">
        <MessageSquare size={14} aria-hidden="true" /> {lang === "ar" ? "التعليقات" : "Comments"}
      </h2>
      {!open ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 border border-foreground/15 px-5 py-3 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:border-primary hover:text-primary-ink"
          >
            {lang === "ar" ? "اعرض التعليقات" : "Load comments"}
          </button>
          <p className="text-xs text-foreground/50">
            {lang === "ar" ? "بتتحمل من GitHub Discussions عن طريق giscus.app." : "Loads the thread from GitHub Discussions via giscus.app."}
          </p>
        </div>
      ) : (
        <div ref={box} className="giscus min-h-40" />
      )}
    </section>
  );
}
