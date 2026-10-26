"use client";

/*
 * PaletteMount — the command palette, loaded on demand.
 *
 * Every page used to ship the whole palette (its UI, its command list and a
 * case index) whether or not anyone pressed Ctrl/⌘K. Now only this listener
 * is on the page; the first Ctrl/⌘K, "/" or Search click loads the palette
 * (one small chunk + /palette-index.json) and opens it. From then on the
 * palette's own listeners take over.
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

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

  return loaded ? <CommandPalette initialOpen /> : null;
}
