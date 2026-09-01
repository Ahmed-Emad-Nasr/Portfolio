"use client";

/*
 * ServiceWorkerRegister.tsx
 * Author: Ahmed Emad Nasr
 *
 * Registers public/sw.js after load, not before — registering a SW is extra
 * work for the browser, and the most important thing in the first 3 seconds
 * of a page's life is LCP, not offline support.
 *
 * `normalizePublicHref` is the same function every asset path on the site
 * goes through, so /sw.js gets the right basePath (`/Portfolio` in
 * production) without repeating the logic here.
 *
 * No registration in development: a SW caches a copy of the page, which is
 * the exact opposite of what you want while developing — every change would
 * hide behind a stale cached copy.
 */

import { useEffect } from "react";
import { normalizePublicHref } from "@/app/core/config/shared";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register(normalizePublicHref("sw.js")).catch(() => {
        // Offline is progressive enhancement, not a requirement — a failed registration
        // (old browser, privacy settings, and so on) stops nothing else on the site.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
