/*
 * Analytics.tsx
 * Author: Ahmed Emad Nasr
 *
 * There is no analytics running on the site at the moment. This is
 * Plausible — privacy-friendly, no cookies, and no consent banner required
 * because of it in most jurisdictions. Deliberately not Google Analytics:
 * this is a simple static portfolio, it does not need full fingerprinting
 * or personal data.
 *
 * ═══ WHY IT IS OFF BY DEFAULT ═══
 *
 * The script needs a real domain registered in your Plausible account (or a
 * self-hosted instance). I have no account and no domain to create while
 * writing this code, and I am not going to invent one. It follows exactly
 * the same pattern as the contact form: if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
 * is absent the component returns null — no script, no network request.
 *
 * ═══ TO TURN IT ON ═══
 *
 *   1. https://plausible.io → create a site with the site's domain
 *      (or point it at your self-hosted instance if you have one).
 *   2. Add NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com to the build
 *      environment (a GitHub Actions secret/env, like the other
 *      NEXT_PUBLIC_* variables).
 *   3. If you self-host, change PLAUSIBLE_SCRIPT_SRC below to your
 *      server's script path.
 */

import Script from "next/script";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SCRIPT_SRC = "https://plausible.io/js/script.js";

export default function Analytics() {
  if (!PLAUSIBLE_DOMAIN) return null;

  return (
    <Script
      src={PLAUSIBLE_SCRIPT_SRC}
      data-domain={PLAUSIBLE_DOMAIN}
      strategy="afterInteractive"
    />
  );
}
