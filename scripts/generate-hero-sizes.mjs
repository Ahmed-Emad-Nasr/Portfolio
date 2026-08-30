/*
 * scripts/generate-hero-sizes.mjs
 *
 * بيولّد نسخ متعدّدة المقاسات من صورة الـ hero.
 *
 * ═══ ليه ═══
 *
 * الموقع مصدَّر بـ output: "export" وشغّال على GitHub Pages، يعني
 * `images.unoptimized: true` إجباري. ووقتها <Image> بتاعة Next بترندر
 * <img> عادي **من غير srcset** — الـ prop اسمها `sizes` بتبقى موجودة
 * في الكود ومالهاش أي أثر، لأن مفيش صور بمقاسات تانية أصلاً عشان يختار
 * من بينها.
 *
 * النتيجة: تليفون بشاشة 360px بيحمّل نفس الملف بالظبط اللي بيتحمّل على
 * شاشة 4K. الصورة دي هي عنصر الـ LCP، يعني ده بيدخل مباشرة في الدرجة.
 *
 * ═══ التشغيل ═══
 *
 *   npm i -D sharp
 *   node scripts/generate-hero-sizes.mjs
 *
 * بيقرا:  public/Assets/art-gallery/Images/logo/3omda.webp
 * بيكتب:  3omda-320.webp / 3omda-420.webp / 3omda-560.webp / 3omda-840.webp
 *         (جنب الأصل، فالأصل بيفضل شغّال كـ fallback وكصورة الـ OG)
 *
 * شغّله مرة واحدة بعد أي تغيير في الصورة الأصلية، والناتج بيتعمله commit.
 */

import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const SOURCE = "public/Assets/art-gallery/Images/logo/3omda.webp";

/* 320 و420 بيغطّوا كل التليفونات تقريباً (عرض الصورة = 80vw تحت 968px).
   560 هو المقاس المعروض على الديسكتوب. 840 للشاشات بكثافة 1.5x. */
const WIDTHS = [320, 420, 560, 840];

/* quality 78 على WebP بيبقى بصرياً مطابق تقريباً عند المقاسات دي وبيوفّر
   حوالي 35% مقارنةً بـ 90. effort: 6 بيبطّأ البناء وبيصغّر الملف — والبناء
   بيحصل مرة واحدة، فده الاتجاه الصح للمقايضة. */
const QUALITY = 78;

async function main() {
  try {
    await stat(SOURCE);
  } catch {
    console.error(`[hero-sizes] مش لاقي الأصل: ${SOURCE}`);
    console.error("[hero-sizes] شغّل السكربت من جذر المشروع.");
    process.exit(1);
  }

  const meta = await sharp(SOURCE).metadata();
  console.log(`[hero-sizes] الأصل: ${meta.width}×${meta.height}`);

  await mkdir(dirname(SOURCE), { recursive: true });

  for (const width of WIDTHS) {
    // متكبّرش صورة أصغر من المطلوب — ده بيزوّد البايتس من غير أي تفاصيل.
    if (meta.width && width > meta.width) {
      console.log(`[hero-sizes] تخطّي ${width}px — أكبر من الأصل`);
      continue;
    }

    const out = SOURCE.replace(/\.webp$/, `-${width}.webp`);
    const info = await sharp(SOURCE)
      .resize(width, width, { fit: "cover", position: "attention" })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);

    console.log(`[hero-sizes] ${out} — ${(info.size / 1024).toFixed(1)} KB`);
  }

  console.log("[hero-sizes] تمام. حدّث srcSet في sensei-home.tsx لو غيّرت المقاسات.");
}

main().catch((err) => {
  console.error("[hero-sizes] فشل:", err);
  process.exit(1);
});
