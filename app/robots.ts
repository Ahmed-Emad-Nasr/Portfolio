/*
 * robots.ts
 * Author: Ahmed Emad Nasr
 *
 * ⚠️ ملحوظة مهمة: الزواحف بتقرا robots.txt من جذر الدومين بس، يعني
 * https://ahmed-emad-nasr.github.io/robots.txt — مش من /Portfolio/robots.txt.
 * وده جذر مشترك بين كل مشاريعك على GitHub Pages، فمش تحت تحكم الريبو ده.
 *
 * الملف ده مفيد في حالتين: لو حطيت custom domain على الجذر، أو كملف مرجعي
 * توضّح فيه نيّتك. الـ sitemap نفسه شغّال عادي — قدّمه يدوي من Search Console.
 */

import type { MetadataRoute } from "next";
import { SITE_BASE_URL, absoluteUrl } from "@/app/core/config/site";

// مطلوبة مع output: "export" — Next 16 بيرفض أي metadata route من غيرها،
// حتى لو الدالة نفسها مفيهاش أي حاجة ديناميكية.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_BASE_URL,
  };
}
