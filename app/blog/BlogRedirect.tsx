"use client";

import { useEffect } from "react";
import Link from "next/link";
import { normalizePublicHref } from "./blog-utils";

export default function BlogRedirect() {
  useEffect(() => {
    const { search, hash } = window.location;
    window.location.replace(`${normalizePublicHref("/")}${search}${hash || "#cases"}`);
  }, []);

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-6 bg-background">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
        The case library moved —{" "}
        <Link href="/#cases" className="text-primary-ink underline-offset-4 hover:underline">
          open it on the home page
        </Link>
      </p>
    </main>
  );
}
