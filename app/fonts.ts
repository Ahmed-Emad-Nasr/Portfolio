/*
 * app/fonts.ts — the four families of the design, self-hosted through
 * next/font/local.
 *
 * next/font preloads each file and generates a size-matched fallback, so
 * text does not jump when the real font arrives (the hero headline used to
 * reflow and push the page down: a layout shift of 0.23 on desktop).
 *
 *  · Outfit, JetBrains Mono — the Latin variable files from @fontsource.
 *  · Dela Gothic One, Yuji Syuku — Japanese fonts cut down to the characters
 *    this site uses (scripts/subset-fonts.py). Noto Sans JP, the original
 *    theme's fallback, is not loaded: these two cover every character.
 */

import localFont from "next/font/local";

export const outfit = localFont({
  src: "./fonts/outfit-latin.woff2",
  weight: "100 900",
  variable: "--font-outfit",
  display: "swap",
});

export const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "100 800",
  variable: "--font-jetbrains",
  display: "swap",
});

export const delaGothic = localFont({
  src: "./fonts/dela-gothic-one.woff2",
  weight: "400",
  variable: "--font-dela",
  display: "swap",
});

export const yujiSyuku = localFont({
  src: "./fonts/yuji-syuku.woff2",
  weight: "400",
  variable: "--font-yuji",
  /* "optional", not "swap": the brush line under the hero name is set in
     it, and swapping it in after first paint changed that line's height —
     the whole hero shifted (CLS 0.14 on desktop). With optional the browser
     uses Yuji only if it is ready within ~100 ms, otherwise keeps the
     fallback for this page view; the file is cached for the next one. It is
     decoration only, so a fallback glyph on a first visit costs nothing. */
  display: "optional",
  /* None of the decorative kanji is the page's main text — no need to
     compete with the headline font for bandwidth */
  preload: false,
});
