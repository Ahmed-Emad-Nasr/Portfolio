"use client";

/*
 * blog/components/useCopyLink.ts
 *
 * The clipboard logic for the "Copy link" buttons. BlogCard and CaseArticle
 * each had their own verbatim copy of it — and both reported "Link copied"
 * even when the copy had failed, because the fallback's result was never
 * checked. Now a failure is a state of its own and the button says so.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "done" | "error";

const RESET_MS = 1800;

const legacyCopy = (text: string): boolean => {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(field);
  return ok;
};

export function useCopyLink() {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    let ok = false;
    try {
      // The clipboard API needs a secure context (https or localhost)
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }

    setState(ok ? "done" : "error");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), RESET_MS);
  }, []);

  return { state, copy };
}
