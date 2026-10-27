/*
 * Analytics.tsx — renders the analytics script chosen in
 * lib/analytics.ts, or nothing at all when none is configured.
 */

import Script from "next/script";
import { ANALYTICS } from "@/lib/analytics";

export default function Analytics() {
  if (!ANALYTICS) return null;

  if (ANALYTICS.provider === "Plausible") {
    return <Script src={ANALYTICS.script} data-domain={ANALYTICS.domain} strategy="afterInteractive" />;
  }

  return (
    <Script
      src={ANALYTICS.script}
      data-cf-beacon={JSON.stringify({ token: ANALYTICS.token })}
      strategy="afterInteractive"
    />
  );
}
