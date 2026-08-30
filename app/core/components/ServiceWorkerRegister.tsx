"use client";

/*
 * ServiceWorkerRegister.tsx
 * Author: Ahmed Emad Nasr
 *
 * بيسجّل public/sw.js بعد الـ load، مش قبلها — تسجيل الـ SW شغلانة إضافية
 * على المتصفح، وأول 3 ثواني من عمر الصفحة أهم حاجة فيهم LCP، مش أوفلاين.
 *
 * `normalizePublicHref` هي نفس الدالة اللي كل مسارات الأصول في الموقع
 * بتعدّي منها، فـ /sw.js بياخد basePath الصح (`/Portfolio` وقت production)
 * من غير ما نكرر المنطق هنا.
 *
 * مفيش تسجيل في development: الـ SW بيكاش نسخة من الصفحة، وده بالظبط
 * عكس اللي محتاجه وإنت بتـ dev — كل تعديل هيتخبى ورا نسخة قديمة متخزّنة.
 */

import { useEffect } from "react";
import { normalizePublicHref } from "@/app/core/config/shared";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register(normalizePublicHref("sw.js")).catch(() => {
        // الأوفلاين progressive enhancement مش شرط أساسي — فشل التسجيل
        // (متصفح قديم، إعدادات خصوصية..إلخ) مايوقفش حاجة تانية في الموقع.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
