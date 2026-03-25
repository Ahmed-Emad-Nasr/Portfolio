"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, trackSeoSnapshot } from "@/app/core/utils/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    trackPageView(path);
    trackSeoSnapshot(path);
  }, [pathname, searchParams]);

  return null;
}
