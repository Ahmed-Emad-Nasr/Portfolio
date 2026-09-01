/*
 * File: SectionHeader.tsx
 *
 * Server Component — no "use client", no React.memo, 0 KB of JS shipped.
 *
 * APPEARANCE COMES FROM globals.css SECTION 16.
 *
 * This used to take a `titleClassName` prop, and each of the four callers
 * passed its own module's `.title` — four byte-identical copies of the same
 * eight declarations plus the two underline pseudo-elements, in four files.
 *
 * Now the heading carries data-fx="section-title" and the module files hold
 * nothing about it. If a section needs the large variant, pass size="lg";
 * `className` is still available but is for layout only (margins, grid
 * placement) — never for the title's own appearance.
 */

interface SectionHeaderProps {
  japaneseText: string;
  englishText: string;
  /** Layout-only class. Appearance belongs to the primitive. */
  className?: string;
  /** "md" is the default (2.6rem). "lg" is the 3.5rem variant. */
  size?: "md" | "lg";
}

export default function SectionHeader({
  japaneseText,
  englishText,
  className,
  size = "md",
}: SectionHeaderProps) {
  return (
    <h2
      className={className}
      data-fx="section-title"
      data-title={size === "lg" ? "lg" : undefined}
    >
      {/* lang="ja" makes the :lang(ja) rule in globals.css give this text a
          deliberate CJK font instead of letting the browser pick whichever
          Japanese face happens to be installed — and it stops screen readers
          from pronouncing the kanji with English phonetics. */}
      <span lang="ja">{japaneseText} •</span>
      <span lang="en"> {englishText}</span>
    </h2>
  );
}
