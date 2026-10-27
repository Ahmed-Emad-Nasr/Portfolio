"use client";

/*
 * CursorMount — loads the custom katana cursor only where it can appear:
 * a precise pointer (mouse / trackpad) and no reduced-motion preference.
 * Phones and tablets never download it; on a desktop it arrives after the
 * page is idle, so it never competes with the first paint.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CursorOverlay = dynamic(() => import("@/components/layout/CursorOverlay"), { ssr: false });

export default function CursorMount() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = idle(() => setOn(true));
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
  }, []);
  return on ? <CursorOverlay /> : null;
}
