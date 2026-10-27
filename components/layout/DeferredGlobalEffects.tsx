"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SpotlightHost = dynamic(() => import("@/components/ui/Motion").then((mod) => mod.SpotlightHost), {
  ssr: false,
});
const OffscreenAnimations = dynamic(() => import("@/lib/perf/OffscreenAnimations"), { ssr: false });

export default function DeferredGlobalEffects() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1200));
    const id = idle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  return ready ? (
    <>
      <SpotlightHost />
      <OffscreenAnimations />
    </>
  ) : null;
}
