"use client";

/*
 * CodeBlock — the <pre> of a post (Shiki has already coloured it at build
 * time). Adds the language label and a copy button; on an Arabic page the
 * code stays left-to-right.
 */

import { useRef, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ children, ...props }: ComponentProps<"pre"> & { "data-language"?: string }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = props["data-language"];

  const copy = async () => {
    const text = ref.current?.querySelector("code")?.innerText ?? ref.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked (http, old browser): select the code instead */
      const range = document.createRange();
      if (ref.current) range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  return (
    <div className="code-block group/code not-prose relative my-8" dir="ltr">
      <div className="flex items-center justify-between gap-4 border border-b-0 border-foreground/10 bg-foreground/[0.03] px-4 py-2">
        <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.25em] text-foreground/60">
          {lang && lang !== "text" ? lang : "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-primary-ink focus-visible:text-primary-ink"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre ref={ref} {...props} tabIndex={0} data-lenis-prevent="">
        {children}
      </pre>
    </div>
  );
}
