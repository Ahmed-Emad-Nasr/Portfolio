"use client";

/*
 * cursor-mount.tsx
 *
 * Exists to hold the dynamic import with ssr: false.
 *
 * Why: `next/dynamic` with `ssr: false` isn't allowed inside a Server Component,
 * and app/layout.tsx **is** a Server Component (it exports `metadata`, which is something
 * only Server Components can do). Putting it here, behind a "use client" boundary,
 * is the supported pattern.
 *
 * ═══ The change ═══
 *
 * `dynamic()` starts loading the chunk as soon as the component renders — so on
 * a phone the chunk was fully downloaded and only then did the component read
 * matchMedia("(pointer: fine)") inside and return without doing anything.
 *
 * And that chunk isn't small: useMotionValue + useSpring pull in framer-motion's entire
 * animation engine behind them. Bytes downloaded, parsed and executed on the critical
 * path, on a device that can never use them.
 *
 * The check now happens **before** the import: the phone never even requests the file.
 * The state is necessary so the first browser render matches what came from the server
 * (null in both cases) — no hydration mismatch.
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isTouchDevice } from "@/app/core/hooks/useDeviceTier";
import { MotionProvider } from "@/app/core/components/MotionInView";

const CustomCursor = dynamic(() => import("./custom-cursor"), { ssr: false });

export default function CursorMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isTouchDevice()) return;
    // reduced-motion also disables it: a spring-driven cursor is exactly the kind of motion
    // that setting exists for.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  /*
   * MotionProvider (framer-motion's <LazyMotion>) lives here rather than in
   * layout.tsx. custom-cursor.tsx is the only remaining `m.*` consumer in
   * the site — the loader's exit is plain CSS now — and it is desktop-only.
   *
   * Mounting the provider at the root meant the motion engine loaded for
   * every visitor, including the ones this component returns null for.
   * Here it is on the far side of both the touch check above and the
   * dynamic import below, so it is requested only when it will be used.
   */
  return (
    <MotionProvider>
      <CustomCursor />
    </MotionProvider>
  );
}
