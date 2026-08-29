/*
 * blog/blog-types.ts — RE-EXPORT SHIM
 *
 * نفس القصة بتاعة blog-utils: الأنواع دي كانت متعرّفة هنا وفي
 * core/config/portfolio.ts في نفس الوقت. تعريفين لنفس النوع معناها إن أي
 * حقل بيتضاف في واحد وميتضافش في التاني بيعدّي من غير ما TypeScript يزعّق —
 * لحد ما القيمة توصل للـ runtime ناقصة.
 *
 * المصدر الوحيد بقى core/config/shared.ts.
 */

export type {
  PdfResource,
  GalleryState,
  ChannelVideo,
} from "@/app/core/config/shared";
