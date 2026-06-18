/*
 * File: experienceUtils.ts
 * PERF BUILD:
 * - Removed try...catch and isNaN safety checks.
 * - Replaced new Date().getTime() with Date.parse() for zero object allocation.
 * - Inlined pluralization logic to eliminate Call Stack overhead.
 * - Pre-calculated MS_PER_MONTH constant.
 */

// 2629946880 = 1000 * 60 * 60 * 24 * 30.4391898
const MS_PER_MONTH = 2629946880; 

export const calculateExperience = (startDate: string, endDate?: string): string => {
  // استخدام Date.parse سريع جداً ولا يحجز Object في الذاكرة
  const start = Date.parse(startDate);
  const end = endDate ? Date.parse(endDate) : Date.now();

  const totalMonths = Math.floor((end - start) / MS_PER_MONTH);
  const years = Math.floor(totalMonths / 12);
  const mos = totalMonths % 12;

  // Inlined Pluralization (بدون استدعاء دوال خارجية)
  if (years > 0 && mos > 0) return `${years} Year${years > 1 ? "s" : ""} ${mos} Month${mos > 1 ? "s" : ""}`;
  if (years > 0) return `${years} Year${years > 1 ? "s" : ""}`;
  if (totalMonths > 0) return `${totalMonths} Month${totalMonths > 1 ? "s" : ""}`;
  
  return "< 1 mo";
};