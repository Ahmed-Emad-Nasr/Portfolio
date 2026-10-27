"use client";

/* Only this listener ships with the page; the first Ctrl/⌘K (or a
   "sensei:palette" event) loads the palette chunk, which then takes over. */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("@/components/layout/CommandPalette"), { ssr: false });

export default function PaletteMount() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setLoaded(true);
      }
    };
    const onOpen = () => setLoaded(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("sensei:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sensei:palette", onOpen);
    };
  }, [loaded]);

  return loaded ? <CommandPalette /> : null;
}
