import {
  Dela_Gothic_One,
  JetBrains_Mono,
  Noto_Sans_JP,
  Outfit,
  Yuji_Syuku,
} from "next/font/google";

/**
 * app/fonts.ts — the Sensei-Dev font set, the way that site now loads it.
 *
 * Fonts are fetched from Google at build time and emitted as static,
 * self-hosted assets by `next/font` (no files in /public, no render-blocking
 * request to fonts.googleapis.com at runtime). next/font also generates a
 * size-adjusted fallback for each family, so the text does not jump when the
 * real font arrives, and preloads the Latin files the first screen needs.
 *
 * Japanese families are large, so they are excluded from preloading and are
 * only downloaded when a glyph from their unicode-range is actually rendered.
 *
 * Wired up in two places: `fontVariables` goes on <html> (app/layout.tsx),
 * and the --font-* stacks in globals.css read the variables. Two faces stay
 * outside next/font on purpose: IBM Plex Sans Arabic for Arabic posts
 * (app/fonts-arabic.css — the Sensei-Dev set has no Arabic) and the small
 * Yuji Syuku cut of the characters this site uses ("Yuji Syuku Site",
 * app/fonts-yuji-site.css),
 * which sits first in the Japanese stacks so the brush text costs one small
 * file instead of several Google slices.
 */

export const displayFont = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-google",
  fallback: ["Noto Sans JP", "system-ui", "sans-serif"],
});

export const bodyFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-google",
  fallback: ["system-ui", "sans-serif"],
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-google",
  fallback: ["ui-monospace", "monospace"],
});

export const jpFont = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jp-google",
  preload: false,
  fallback: ["Hiragino Sans", "Yu Gothic", "sans-serif"],
});

export const jpBrushFont = Yuji_Syuku({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jp-brush-google",
  preload: false,
  fallback: ["Noto Sans JP", "Yu Mincho", "serif"],
});

export const fontVariables = [
  displayFont.variable,
  bodyFont.variable,
  monoFont.variable,
  jpFont.variable,
  jpBrushFont.variable,
].join(" ");
