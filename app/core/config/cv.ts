/*
 * core/config/cv.ts
 * Author: Ahmed Emad Nasr
 *
 * الحاجات القليلة اللي صفحة /cv محتاجاها ومش موجودة في أي config تاني.
 *
 * لاحظ إن الملف ده **مفيهوش** خبرات ولا مشاريع ولا شهادات ولا جوايز ولا
 * مهارات: كل دول بيتقروا من مصادرهم الأصلية (experience.ts، projects.ts،
 * certifications.ts، achievements.ts، skills.ts).
 *
 * ده مقصود. أسهل طريقة تعمل بيها صفحة CV هي إنك تنسخ النصوص فيها — وبعد
 * شهرين تلاقي الموقع بيقول رقم والـ CV بيقول رقم تاني، وهي نفس المشكلة
 * اللي موجودة دلوقتي بين موقعك والـ PDF بتاعك. مصدر واحد معناه إن ده
 * مستحيل يحصل.
 */

export const CV_CONTACT = {
  name: "Ahmed Emad Nasr",
  headline: "SOC Analyst · Incident Response · DFIR",
  location: "Cairo, Egypt",
  email: "ahmed.em.nasr@gmail.com",
  phone: "+20 101 397 2690",
  linkedin: { label: "linkedin.com/in/ahmed-emad-nasr", href: "https://www.linkedin.com/in/ahmed-emad-nasr/" },
  github: { label: "github.com/Ahmed-Emad-Nasr", href: "https://github.com/Ahmed-Emad-Nasr" },
  site: { label: "ahmed-emad-nasr.github.io/Portfolio", href: "https://ahmed-emad-nasr.github.io/Portfolio/" },
} as const;

/** المقرّرات المرتبطة — موجودة في الـ PDF ومش موجودة في experience.ts */
export const RELEVANT_COURSEWORK = [
  "Network Security",
  "Digital Forensics",
  "Cryptography",
  "Operating Systems",
  "Ethical Hacking",
] as const;

/** مسار ملف الـ PDF. بيعدّي على normalizePublicHref زي أي أصل تاني. */
export const CV_PDF_HREF = "Assets/cv/AhmedEmadNasr_CV.pdf";

/**
 * سطر افتتاحي. ده المكان الوحيد في الموقع اللي بيقول "إيه اللي بدوّر عليه"
 * صراحةً — وهو أول سؤال في دماغ أي حد بيفتح CV.
 */
export const CV_SUMMARY =
  "Information Security graduate working across SOC operations, incident response, and digital forensics. " +
  "Published 38 investigation reports covering 28 MITRE ATT&CK techniques, contributed a detection rule to " +
  "the open-source SOC Fortress project, and taught security fundamentals to 160+ students.";
