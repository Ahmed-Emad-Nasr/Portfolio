"use client";

/* Registers public/sw.js (offline support) after the page has loaded, in
   production only — in development a cached page would hide every change. */

import { useEffect } from "react";
import { normalizePublicHref } from "@/lib/shared";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register(normalizePublicHref("sw.js")).catch(() => {});
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
