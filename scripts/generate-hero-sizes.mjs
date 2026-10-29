/*
 * generate-hero-sizes.mjs — the hero portrait at 320/420/560/840px for its
 * srcset (a static export has no image optimizer). Run after changing
 * public/Assets/art-gallery/Images/logo/3omda.webp, and commit the output.
 *
 *   npm run hero:sizes
 */

import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import { dirname } from "node:path";

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

  console.log("[hero-sizes] done. Update HERO_PHOTO in components/home/HeroSection.tsx if you changed the sizes.");
}

main().catch((err) => {
  console.error("[hero-sizes] failed:", err);
  process.exit(1);
});
