/*
 * scripts/generate-hero-sizes.mjs
 *
 * Generates multi-size variants of the hero image.
 *
 * ═══ Why ═══
 *
 * The site is exported with output: "export" and hosted on GitHub Pages, so
 * `images.unoptimized: true` is mandatory. In that mode Next's <Image> renders
 * a plain <img> **without srcset** — the `sizes` prop is present
 * in the code but has no effect, because there are no other image sizes to choose
 * from.
 *
 * Result: a phone with a 360px screen downloads exactly the same file as a
 * 4K screen. This image is the LCP element, so it feeds directly into the score.
 *
 * ═══ Usage ═══
 *
 *   npm i -D sharp
 *   node scripts/generate-hero-sizes.mjs
 *
 * Reads:   public/Assets/art-gallery/Images/logo/3omda.webp
 * Writes:  3omda-320.webp / 3omda-420.webp / 3omda-560.webp / 3omda-840.webp
 *          (next to the original, so the original still works as a fallback and as the OG image)
 *
 * Run it once after any change to the original image, and commit the output.
 */

import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const SOURCE = "public/Assets/art-gallery/Images/logo/3omda.webp";

/* 320 and 420 cover almost every phone (image width = 80vw below 968px).
   560 is the size shown on desktop. 840 for 1.5x density screens. */
const WIDTHS = [320, 420, 560, 840];

/* quality 78 on WebP is visually near-identical at these sizes and saves
   about 35% compared to 90. effort: 6 slows the build and shrinks the file — and the build
   happens once, so that's the right direction for the trade-off. */
const QUALITY = 78;

async function main() {
  try {
    await stat(SOURCE);
  } catch {
    console.error(`[hero-sizes] source not found: ${SOURCE}`);
    console.error("[hero-sizes] run the script from the project root.");
    process.exit(1);
  }

  const meta = await sharp(SOURCE).metadata();
  console.log(`[hero-sizes] source: ${meta.width}×${meta.height}`);

  await mkdir(dirname(SOURCE), { recursive: true });

  for (const width of WIDTHS) {
    // Don't upscale an image smaller than requested — it adds bytes without adding detail.
    if (meta.width && width > meta.width) {
      console.log(`[hero-sizes] skipping ${width}px — larger than the source`);
      continue;
    }

    const out = SOURCE.replace(/\.webp$/, `-${width}.webp`);
    const info = await sharp(SOURCE)
      .resize(width, width, { fit: "cover", position: "attention" })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);

    console.log(`[hero-sizes] ${out} — ${(info.size / 1024).toFixed(1)} KB`);
  }

  console.log("[hero-sizes] done. Update srcSet in sensei-home.tsx if you changed the sizes.");
}

main().catch((err) => {
  console.error("[hero-sizes] failed:", err);
  process.exit(1);
});
