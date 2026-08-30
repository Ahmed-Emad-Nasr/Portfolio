import type { MetadataRoute } from "next";

// مطلوبة مع output: "export" — زي sitemap.ts و robots.ts بالظبط.
// من غيرها next build بيفشل وقت "Collecting page data" بـ:
//   "export const dynamic = force-static/revalidate not configured
//    on route /manifest.webmanifest with output: export"
export const dynamic = "force-static";

/*
 * manifest.ts
 *
 * الـ metadata في layout.tsx فيها `appleWebApp: { capable: true }` — يعني
 * الموقع بيعلن إنه قابل للتثبيت على الشاشة الرئيسية. من غير manifest
 * كان الإعلان ده ناقص: أندرويد مبيعرضش خيار التثبيت خالص، وiOS بياخد
 * screenshot للصفحة ويستخدمه كأيقونة.
 *
 * Next بيولّد /manifest.webmanifest من الملف ده وقت الـ build، وبيضيف
 * الـ basePath للمسارات لوحده.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ahmed Emad Nasr — SOC & Cybersecurity Analyst",
    short_name: "3omda",
    description:
      "SOC operations, incident response, digital forensics, and malware analysis case reports.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    /*
     * المقاسات اللي أندرويد بيطلبها هي 192 و512. الصورة دي مربعة
     * (560×560) فبتشتغل كأيقونة، بس مش بالمقاس المثالي.
     *
     * ⭐ لو عايز أيقونة مظبوطة: صدّر 192 و512 وحطهم في
     *   public/Assets/icons/ وغيّر المسارات هنا. الـ purpose: "maskable"
     *   بيحتاج هامش آمن حوالين اللوجو (20% من كل ناحية) عشان أندرويد
     *   بيقص الأيقونة لدايرة على بعض الأجهزة.
     */
    icons: [
      {
        src: "/Assets/art-gallery/Images/logo/3omda.webp",
        sizes: "560x560",
        type: "image/webp",
      },
    ],
  };
}
