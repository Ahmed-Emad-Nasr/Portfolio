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

export const SECURITY_CONTACT_EMAIL = "ahmed.em.nasr@gmail.com";

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
