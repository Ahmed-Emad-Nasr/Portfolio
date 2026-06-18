/*
 * File: bulletUtils.ts
 * PERF BUILD:
 * - Removed expensive global Regex `replace(/\s+/g)`.
 * - Eliminated `map().filter()` chains to prevent multi-array memory allocation overhead.
 * - Uses blazing fast `includes()` (Native C++ string matching) before attempting any `split()`.
 */

export const toBulletItems = (text: string): string[] => {
  if (!text) return [];

  let parts: string[];

  // 1. فحص سريع جداً لمعرفة نوع الفاصل قبل عمل أي Split
  if (text.includes("•")) {
    parts = text.split("•");
  } else if (text.includes(".") || text.includes(";")) {
    parts = text.split(/[.;]/);
  } else if (text.includes(",")) {
    parts = text.split(",");
  } else {
    // إذا لم يوجد أي فاصل، نعيد النص كما هو بعد تنظيف أطرافه
    const trimmed = text.trim();
    return trimmed ? [trimmed] : [];
  }

  // 2. فلترة وتنظيف في خطوة واحدة (بدون map و filter) لتوفير الذاكرة
  const result: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const val = parts[i].trim();
    if (val) result.push(val);
  }

  return result;
};