/*
 * security.txt (RFC 9116) and the Content-Security-Policy.
 */

import { SITE_BASE_URL } from "@/lib/site";

const SECURITY_CONTACT_EMAIL = "ahmed.em.nasr@gmail.com";

export const SECURITY_TXT_PATH = ".well-known/security.txt";

/** RFC 9116 body. Expires is set from the build date, so every deploy renews it. */
export const securityTxt = (built = new Date()): string => {
  const expires = new Date(built.getTime() + 300 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  return [
    "# Found a security issue on this site? Thank you — please report it privately.",
    `Contact: mailto:${SECURITY_CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString().replace(".000Z", "Z")}`,
    "Preferred-Languages: en, ar",
    `Canonical: ${SITE_BASE_URL}/${SECURITY_TXT_PATH}`,
    "",
  ].join("\n");
};

/*
 * Content-Security-Policy, delivered as a <meta> tag (layout.tsx) because
 * GitHub Pages cannot send response headers. Every origin the site really
 * loads from, and nothing else:
 *   · YouTube: the privacy-enhanced player and its thumbnails
 *   · GitHub: the avatar on the project cards (github.com redirects to
 *     avatars.githubusercontent.com), and the contribution calendar, read
 *     in the browser from github-contributions-api.jogruber.de (api/contributions.ts)
 *   · Web3Forms, which delivers the contact form when a key is set
 *   · 'self' frames: the case pages show their own PDF reports inline
 * 'unsafe-inline' for scripts is required by Next.js static export (its
 * hydration data and the theme bootstrap are inline scripts with
 * no build-stable hash); everything else is locked down. A meta CSP cannot
 * set frame-ancestors — clickjacking protection needs a header (a custom
 * domain behind Cloudflare could add it).
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com https://github.com https://avatars.githubusercontent.com",
  "font-src 'self'",
  "connect-src 'self' https://github-contributions-api.jogruber.de https://api.web3forms.com",
  "frame-src 'self' https://www.youtube-nocookie.com",
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");
