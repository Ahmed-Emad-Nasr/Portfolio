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
      <span>{japaneseText} •</span>
      <span> {englishText}</span>
    </h2>
  );
}