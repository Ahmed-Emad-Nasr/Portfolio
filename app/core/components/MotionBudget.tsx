"use client";

/*
 * MotionBudget — pauses the site's looping decorations (the hero scanner,
 * live dots, the radar, the siren, the home-lab packets …) while their
 * section is off screen. They are CSS animations, so this costs one
 * IntersectionObserver: each top-level section gets data-idle while it is
 * out of view, and globals.css pauses the listed classes inside it.
 *
 * Runs after hydration (React never sees the attribute, so no mismatch),
 * and again on every client-side navigation.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionBudget() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute("data-idle", !e.isIntersecting);
      },
      { rootMargin: "150px 0px" }
    );
    document.querySelectorAll("main section:not(section section), footer").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
