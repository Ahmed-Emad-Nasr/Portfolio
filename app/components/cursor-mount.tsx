"use client";

/*
 * cursor-mount.tsx
 *
 * Exists purely to hold the `ssr: false` dynamic import.
 *
 * WHY: `next/dynamic` with `ssr: false` is forbidden inside a Server
 * Component, and app/layout.tsx IS a Server Component (it exports
 * `metadata`, which only Server Components can do). Putting the call here,
 * behind a "use client" boundary, is the supported pattern.
 *
 * The cursor is desktop-only decoration that pulls in framer-motion's spring
 * engine and subscribes to every pointermove. Deferring it keeps it out of
 * the initial bundle — mobile visitors, who can never see it, never download it.
 */

import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("./custom-cursor"), { ssr: false });

export default function CursorMount() {
  return <CustomCursor />;
}
