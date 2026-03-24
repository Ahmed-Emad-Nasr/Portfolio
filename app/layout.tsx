/*
 * File: layout.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Define root app shell, metadata, and global font/base document setup
 */

import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Overlock } from "next/font/google";

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Ahmed Emad Nasr - Portfolio",
  description:
    "Hello! I'm Ahmed Emad, Soc Analyst and Cybersecurity Engineer. I specialize in protecting digital assets and ensuring online safety. With a passion for cybersecurity, I analyze threats, implement security measures, and stay ahead of cybercriminals to safeguard data and systems.",
  keywords:
    "Ahmed Emad Nasr, Soc Analyst, Cybersecurity Engineer, Incident Response Analyst, Blue Team, Cybersecurity Instructor, Software Engineer, Portfolio",
  authors: [{ name: "Ahmed Emad Nasr" }],
  verification: {
    google: "VCIeVhcDb-vQGmE68weZARtruR_F2bUwv6hcjKYdwqo",
  },
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

// Font objects are created once at module load by next/font/google —
// calling these outside the component is the correct and required pattern.
const overlock = Overlock({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-overlock",
  display: "swap",
});

// Derived once — the class string never changes between renders.
const BODY_CLASS = `bg-black text-white ${overlock.variable}`;

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to FontAwesome CDN for early network connection */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </head>
      <body className={BODY_CLASS}>
        {children}
      </body>
    </html>
  );
}