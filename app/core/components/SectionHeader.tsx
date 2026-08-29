/*
 * File: SectionHeader.tsx
 * PERF BUILD: 
 * - Removed "use client" -> Now a Server Component (0 KB JS shipped to the browser).
 * - Removed React.memo -> Not needed for Server Components.
 * - Stripped extra DOM attributes.
 */

interface SectionHeaderProps {
  japaneseText: string;
  englishText: string;
  titleClassName: string;
}

export default function SectionHeader({
  japaneseText,
  englishText,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <h2 className={titleClassName}>
      {/* lang="ja" بيخلي قاعدة :lang(ja) في globals.css تدّي النص خط CJK
          مقصود بدل ما المتصفح يختار أي خط ياباني موجود على الجهاز — وبيمنع
          الـ screen reader إنه ينطق الكانجي بنطق إنجليزي. */}
      <span lang="ja">{japaneseText} •</span>
      <span lang="en"> {englishText}</span>
    </h2>
  );
}