import {
  Dela_Gothic_One,
  JetBrains_Mono,
  Noto_Sans_JP,
  Outfit,
  Yuji_Syuku,
} from "next/font/google";

/*
 * The Sensei-Dev font set via next/font: downloaded at build time and
 * self-hosted, with size-adjusted fallbacks. The Japanese families are not
 * preloaded (fetched only when a glyph needs them). `fontVariables` goes on
 * <html>; the --font-* stacks in globals.css read them. The site's own small
 * Yuji Syuku cut (app/fonts-yuji-site.css) sits first in the Japanese stacks.
 */

const displayFont = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-google",
  fallback: ["Noto Sans JP", "system-ui", "sans-serif"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-google",
  fallback: ["system-ui", "sans-serif"],
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-google",
  fallback: ["ui-monospace", "monospace"],
});

const jpFont = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jp-google",
  preload: false,
  fallback: ["Hiragino Sans", "Yu Gothic", "sans-serif"],
});

const jpBrushFont = Yuji_Syuku({
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
