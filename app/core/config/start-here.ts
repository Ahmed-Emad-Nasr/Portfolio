/*
 * core/config/start-here.ts
 * Author: Ahmed Emad Nasr
 *
 * مكتبة فيها 38 تقرير بتشلّ اللي فاتحها. الزائر — غالباً حد بيراجع طلبك
 * وعنده خمس دقايق — بيبص على الحيطة، مبيعرفش يبدأ منين، ويقفل.
 *
 * التلاتة دول مختارين عشان يغطّوا تلات قدرات مختلفة: كتابة قواعد كشف،
 * تحقيق DFIR كامل، وتحليل malware. مش أطول التقارير ولا أحدثها — أوضح
 * تلاتة بيوصّلوا "ده اللي بعرف أعمله".
 *
 * ⚠️ راجع الاختيار والأسباب. أنا مشوفتش الـ PDFs، فالاختيار مبني على
 * العناوين والتاجات — إنت اللي عارف أنهي تقرير فعلاً بيمثّلك.
 *
 * الـ id لازم يطابق caseEvidenceLibrary[].id في config/cases.ts.
 */

export type StartHereEntry = {
  id: string;
  /** اسم قصير للعرض — مش لازم يكون عنوان التقرير الكامل */
  label: string;
  /** ليه ده أول حاجة تتقري — سطر واحد، بصيغة "إيه اللي هتشوفه" */
  why: string;
  /** وقت القراءة التقريبي */
  minutes: number;
};

export const startHere: readonly StartHereEntry[] = [
  {
    id: "3omda-custom-detection-rules",
    label: "Custom Wazuh detection rules",
    why: "Detection engineering — writing, tuning, and validating rules, including one merged into SOC Fortress.",
    minutes: 8,
  },
  {
    id: "data-exfiltration-investigation",
    label: "Data exfiltration & credential compromise",
    why: "A full DFIR investigation end to end: memory forensics, timeline reconstruction, and the containment call.",
    minutes: 12,
  },
  {
    id: "malware-analysis-wannacry",
    label: "WannaCry analysis & response",
    why: "Static and dynamic malware analysis, IOC extraction, and the response plan built from them.",
    minutes: 10,
  },
];
