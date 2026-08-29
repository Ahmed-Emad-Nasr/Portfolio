/*
 * blog/blog-utils.ts — RE-EXPORT SHIM
 *
 * الملف ده كان نسخة كاملة تانية من normalizePublicHref و getThumbnail و
 * formatDate — بالحرف، بما فيها `dateFormatter` و `dateCache` تانيين.
 *
 * يعني كان فيه كاشين منفصلين لنفس التواريخ في الذاكرة، وأي تعديل على
 * منطق المسارات لازم يتعمل في مكانين وإلا الصفحتين يفترقوا في السلوك من غير
 * ما حد ياخد باله.
 *
 * دلوقتي المصدر واحد: core/config/shared.ts. الملف ده فضل موجود عشان
 * الـ imports الحالية (CaseArticle، page-client، Terminal، CommandPalette)
 * تفضل شغالة من غير تغيير.
 */

export {
  normalizePublicHref,
  getThumbnail,
  formatDate,
} from "@/app/core/config/shared";
