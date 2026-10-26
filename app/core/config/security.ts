/*
 * core/config/security.ts
 * Author: Ahmed Emad Nasr
 *
 * Disclosure contact for the site: security.txt (RFC 9116) and the PGP key.
 *
 * ── Adding your PGP key (one time) ─────────────────────────────────────────
 *   1. gpg --full-generate-key            (ECC / ed25519, your real email)
 *   2. gpg --armor --export ahmed.em.nasr@gmail.com > public/pgp-key.asc
 *   3. gpg --fingerprint ahmed.em.nasr@gmail.com   → paste the 40 hex chars
 *      into `fingerprint` below (spaces are fine).
 *   4. Optional: gpg --send-keys <fingerprint> --keyserver keys.openpgp.org
 *
 * While `fingerprint` is empty the PGP block in the contact section and the
 * Encryption line in security.txt stay hidden — nothing points at a key that
 * isn't there. Never commit the private key: only the armored PUBLIC key.
 */

import { SITE_BASE_URL } from "./site";
import { ANALYTICS } from "./analytics";

const SECURITY_CONTACT_EMAIL = "ahmed.em.nasr@gmail.com";

export const PGP = {
  /** Full fingerprint of the public key (40 hex characters). Empty = hidden. */
  fingerprint: "",
  /** The armored public key, in public/ */
  keyFile: "pgp-key.asc",
};

const cleanFingerprint = (fp: string) => fp.replace(/\s+/g, "").toUpperCase();

export const hasPgpKey = (): boolean => /^[0-9A-F]{40}$/.test(cleanFingerprint(PGP.fingerprint));

/** "ABCD EF01 …" — the way gpg prints it, easy to compare by eye */
export const formattedFingerprint = (): string =>
  cleanFingerprint(PGP.fingerprint).replace(/(.{4})/g, "$1 ").trim();

export const SECURITY_TXT_PATH = ".well-known/security.txt";

/** RFC 9116 body. Expires is set from the build date, so every deploy renews it. */
export const securityTxt = (built = new Date()): string => {
  const expires = new Date(built.getTime() + 300 * 24 * 60 * 60 * 1000);
  expires.setUTCHours(0, 0, 0, 0);
  return [
    "# Found a security issue on this site? Thank you — please report it privately.",
    `Contact: mailto:${SECURITY_CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString().replace(".000Z", "Z")}`,
    ...(hasPgpKey() ? [`Encryption: ${SITE_BASE_URL}/${PGP.keyFile}`] : []),
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
 *   · the analytics provider, only when one is configured (analytics.ts)
 *   · Web3Forms, which delivers the contact form when a key is set
 *   · 'self' frames: the case pages show their own PDF reports inline
 * 'unsafe-inline' for scripts is required by Next.js static export (its
 * hydration data and the theme / reveal bootstraps are inline scripts with
 * no build-stable hash); everything else is locked down. A meta CSP cannot
 * set frame-ancestors — clickjacking protection needs a header (a custom
 * domain behind Cloudflare could add it).
 */
const analyticsOrigins = ANALYTICS ? [new URL(ANALYTICS.script).origin] : [];
const analyticsConnect =
  ANALYTICS?.provider === "Plausible"
    ? ["https://plausible.io"]
    : ANALYTICS
      ? ["https://cloudflareinsights.com"]
      : [];

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${analyticsOrigins.join(" ")}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com https://github.com https://avatars.githubusercontent.com",
  "font-src 'self'",
  `connect-src 'self' https://github-contributions-api.jogruber.de https://api.web3forms.com ${analyticsConnect.join(" ")}`.trim(),
  "frame-src 'self' https://www.youtube-nocookie.com",
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");
