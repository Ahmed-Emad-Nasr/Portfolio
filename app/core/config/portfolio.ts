/*
 * core/config/portfolio.ts — BARREL
 *
 * الملف ده كان 70 كيلوبايت من الداتا في موديول واحد: الخبرات + المشاريع +
 * اليوتيوب + الـ 38 case بكل الـ screenshots. أي ملف بيعمل import منه بيدخل
 * الـ module graph كله معاه.
 *
 * دلوقتي الداتا اتقسمت على خمس ملفات، والملف ده بقى بيعيد تصديرها بس عشان
 * أي import قديم يفضل شغّال.
 *
 * ⭐ للكود الجديد: استورد من الملف المحدد مباشرة، مش من هنا.
 *
 *    import { knowledgeEducationItems } from "@/app/core/config/experience";
 *    import { caseEvidenceLibrary }     from "@/app/core/config/cases";
 *
 * الـ barrel بيخلي الـ tree-shaking هو اللي بيحدد إيه اللي هيوصل للـ bundle،
 * والاستيراد المباشر بيخلي الموضوع مضمون مش متروك للـ bundler.
 */

export * from "./shared";
export * from "./experience";
export * from "./projects";
export * from "./youtube";
export * from "./cases";
