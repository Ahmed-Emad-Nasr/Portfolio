/*
 * lib/analytics.ts — privacy-friendly analytics, off by default.
 *
 * The site is a static export, so this is decided at build time by one of
 * two environment variables (set it in the GitHub Actions workflow, e.g.
 * `env: NEXT_PUBLIC_PLAUSIBLE_DOMAIN: ahmed-emad-nasr.github.io`):
 *
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN   → Plausible (plausible.io, paid, EU-hosted)
 *   NEXT_PUBLIC_CF_ANALYTICS_TOKEN → Cloudflare Web Analytics (free)
 *
 * Both are cookieless and keep no personal profiles, so no consent banner is
 * needed. Whichever is set, the privacy page describes it automatically
 * (it reads ANALYTICS below); with neither set, no script is added at all.
 */

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const CF_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

type AnalyticsConfig =
  | { provider: "Plausible"; domain: string; script: string; policy: string }
  | { provider: "Cloudflare Web Analytics"; token: string; script: string; policy: string };

export const ANALYTICS: AnalyticsConfig | null = PLAUSIBLE_DOMAIN
  ? {
      provider: "Plausible",
      domain: PLAUSIBLE_DOMAIN,
      script: "https://plausible.io/js/script.js",
      policy: "https://plausible.io/data-policy",
    }
  : CF_TOKEN
    ? {
        provider: "Cloudflare Web Analytics",
        token: CF_TOKEN,
        script: "https://static.cloudflareinsights.com/beacon.min.js",
        policy: "https://www.cloudflare.com/web-analytics/",
      }
    : null;
