/*
 * Analytics.tsx
 * Author: Ahmed Emad Nasr
 *
 * مفيش أي analytics متركب في الموقع دلوقتي. ده Plausible — privacy-friendly،
 * مفيهوش cookies، ومفيش consent banner لازم بسببه في معظم الأماكن. مش
 * Google Analytics عمدًا: ده static portfolio بسيط، مش محتاج fingerprinting
 * كامل ولا بيانات شخصية.
 *
 * ═══ ليه مقفول افتراضيًا ═══
 *
 * السكربت محتاج domain حقيقي مسجّل في حساب Plausible بتاعك (أو self-hosted
 * instance). معنديش حساب ولا domain أعمله وأنا بكتب الكود، فمش هفبرك واحد.
 * نفس النمط اللي الفورم ماشي عليه بالظبط: لو `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
 * مش موجود، الكومبوننت بيرجع null — صفر سكربت، صفر طلب شبكة.
 *
 * ═══ عشان تشغّله ═══
 *
 *   1. https://plausible.io → أنشئ site بالـ domain بتاع الموقع
 *      (أو ابعت لـ self-hosted instance بتاعك لو عندك واحد).
 *   2. ضيف NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com في بيئة الـ build
 *      (GitHub Actions secret/env، زي باقي الـ NEXT_PUBLIC_* المتغيرات).
 *   3. لو مستضيف self-hosted، غيّر PLAUSIBLE_SCRIPT_SRC تحت لمسار
 *      السكربت بتاع السيرفر بتاعك.
 */

import Script from "next/script";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SCRIPT_SRC = "https://plausible.io/js/script.js";

export default function Analytics() {
  if (!PLAUSIBLE_DOMAIN) return null;

  return (
    <Script
      src={PLAUSIBLE_SCRIPT_SRC}
      data-domain={PLAUSIBLE_DOMAIN}
      strategy="afterInteractive"
    />
  );
}
