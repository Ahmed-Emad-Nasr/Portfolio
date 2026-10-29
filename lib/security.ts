/*
 * Content-Security-Policy, delivered as a <meta> tag (layout.tsx) because
 * GitHub Pages cannot send response headers. Every origin the site really
 * loads from, and nothing else:
 *   · YouTube: the privacy-enhanced player and its thumbnails
 *   · GitHub: the contribution calendar, read in the browser from
 *     github-contributions-api.jogruber.de (api/contributions.ts)
 *   · Web3Forms, which delivers the contact form when a key is set
 *   · 'self' frames: the case pages show their own PDF reports inline
 * 'unsafe-inline' for scripts is required by Next.js static export (its
 * hydration data and the theme bootstrap are inline scripts with
 * no build-stable hash); everything else is locked down.
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
