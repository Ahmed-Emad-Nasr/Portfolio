"use client";

/* Clipboard state for the "Copy" buttons: idle → done | error → idle */

import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = "idle" | "done" | "error";

export function useCopyLink() {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      ok = false;
    }
    setState(ok ? "done" : "error");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }, []);

  return { state, copy };
}
