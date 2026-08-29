/*
 * core/config/certifications.ts
 * Author: Ahmed Emad Nasr
 *
 * الجاليري كان بيرندر 74 صورة كلها بـ alt="Certification".
 *
 * ليه دي مشكلة حقيقية مش تفصيلة:
 *  - الـ screen reader بيقول "Certification" أربعة وسبعين مرة ورا بعض.
 *  - جوجل مبيعرفش إن دي eJPT ودي HCIA ودي Google Cybersecurity — يعني أغلى
 *    كلمات مفتاحية عندك مش مفهرسة.
 *  - شهادة صورة من غير اسم وجهة إصدار = صورة. باسم ورابط تحقّق = دليل.
 *
 * الملف ده بيربط رقم الصورة (نفس ترقيم image_display/N.webp) ببياناتها.
 * أي رقم مش مذكور هنا بياخد alt احتياطي مفهوم بدل النص المكرر، فالملف ده
 * ممكن يتملّى على مراحل — مش لازم كله مرة واحدة.
 *
 * لو ملّيت الحقول دي، تقدر بعدها تولّد JSON-LD من نوع
 * EducationalOccupationalCredential لكل شهادة، وتضيف فلترة بجهة الإصدار،
 * من نفس المصدر ده من غير أي تكرار.
 */

export type Certification = {
  /** اسم الشهادة زي ما هو مكتوب عليها */
  name: string;
  /** الجهة المانحة */
  issuer?: string;
  /** ISO date — تاريخ الحصول عليها */
  date?: string;
  /** رابط التحقّق من الجهة نفسها (Credly / INE / Huawei / Coursera …) */
  verifyUrl?: string;
};

/**
 * المفتاح = رقم الصورة في `Assets/art-gallery/Images/image_display/{N}.webp`
 *
 * ⚠️ الأرقام اللي تحت أمثلة على الشكل المطلوب — بدّلها بالبيانات الصح عندك.
 * أي رقم متشالش من هنا بيشتغل عادي بالـ fallback.
 */
export const certifications: Record<number, Certification> = {
  // 1: {
  //   name: "eJPT v2",
  //   issuer: "INE Security",
  //   date: "2026-01",
  //   verifyUrl: "https://certs.ine.com/…",
  // },
  // 2: {
  //   name: "HCIA-Cloud Computing V5.0",
  //   issuer: "Huawei",
  //   date: "2024-09",
  // },
};

/** العدد الكلي للصور في الجاليري — مصدر واحد بدل رقم منثور في الكومبوننت */
export const GALLERY_IMAGE_COUNT = 74;

/**
 * النص البديل للصورة رقم `index`.
 *
 * لو الشهادة متعرّفة: "eJPT v2 certificate issued by INE Security".
 * لو لأ: "Certificate 12 of 74" — مش مثالي، بس على الأقل كل صورة ليها هوية
 * مختلفة بدل 74 نسخة من نفس الجملة.
 */
export const certificationAlt = (index: number): string => {
  const cert = certifications[index];
  if (!cert) return `Certificate ${index} of ${GALLERY_IMAGE_COUNT}`;
  return cert.issuer
    ? `${cert.name} certificate issued by ${cert.issuer}`
    : `${cert.name} certificate`;
};
