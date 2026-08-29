/*
 * core/config/achievements.ts
 * Author: Ahmed Emad Nasr
 *
 * قسم "Awards & Achievements" كان موجود في الـ CV ومش موجود على الموقع
 * خالص. ده أغرب فرق بين الاتنين: الأرقام دي (Top 1% على TryHackMe،
 * 44 من 450 في CTF، الأول على 250 مدرّب) هي أقوى حاجة عندك لحد لسه في
 * بداية مشواره — دليل تنافسي من طرف تالت، مش وصف ذاتي.
 *
 * محطوطة كداتا مش كـ JSX عشان تقدر تتفلتر وتتحوّل لـ JSON-LD وتتقرا من
 * الـ command palette من غير تكرار.
 */

export type AchievementKind = "rank" | "award" | "community";

export type Achievement = {
  id: string;
  /** الإنجاز نفسه في سطر — الرقم الأول عشان العين تمسكه */
  title: string;
  /** الجهة أو المنصة */
  context: string;
  kind: AchievementKind;
  /** السنة لو معروفة — سيبها فاضية لو الإنجاز مستمر */
  year?: number;
  /** رابط إثبات: بروفايل، إعلان نتيجة، صفحة القناة */
  proofUrl?: string;
};

export const achievements: readonly Achievement[] = [
  {
    id: "thm-top-1",
    title: "Top 1% globally",
    context: "TryHackMe",
    kind: "rank",
    // proofUrl: "https://tryhackme.com/p/…",  ← ضيف بروفايلك، ده بيتحقق فوراً
  },
  {
    id: "gdg-best-instructor",
    title: "1st place & Best Technical Instructor among 250 instructors",
    context: "Google Developer Groups",
    kind: "award",
    year: 2025,
  },
  {
    id: "depi-top-achiever",
    title: "Top Achiever, Round 4",
    context: "Digital Egypt Pioneers Initiative (DEPI)",
    kind: "award",
  },
  {
    id: "iti-ctf",
    title: "44th of 450",
    context: "ITI & CyberTalents CTF Competition",
    kind: "rank",
  },
  {
    id: "ecpc",
    title: "Top 99 of 1,500 teams",
    context: "Egyptian Collegiate Programming Contest (ECPC)",
    kind: "rank",
  },
  {
    id: "ieee-ghostec",
    title: "2nd place — C-programmed racing robot",
    context: "IEEE GHOSTEC Robotics Competition",
    kind: "award",
  },
  {
    id: "youtube",
    title: "500+ subscribers, 60,000+ views",
    context: "Cybersecurity YouTube channel",
    kind: "community",
    proofUrl: "https://www.youtube.com/@AhmedEmad-0x3omda",
  },
];
