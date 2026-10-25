"use client";

/*
 * The certificate lightbox, in its own chunk with its stylesheet.
 *
 * CredentialsGallery used to import yet-another-react-lightbox/styles.css
 * itself, which made those 5 KB of lightbox CSS a render-blocking
 * stylesheet on the home page — and a preloaded-but-unused one on every
 * other page — although the lightbox only exists once a certificate is
 * opened. Imported dynamically, the CSS now arrives with the lightbox.
 */

import Lightbox, { type LightboxExternalProps } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function CertLightbox(props: LightboxExternalProps) {
  return <Lightbox {...props} />;
}
