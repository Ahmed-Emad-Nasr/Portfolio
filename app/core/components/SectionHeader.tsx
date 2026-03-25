"use client";

/*
 * File: SectionHeader.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Reusable bilingual section heading renderer
 */

import React, { memo } from "react";

interface SectionHeaderProps {
  japaneseText: string;
  englishText: string;
  titleClassName: string;
}

const SectionHeader = memo<SectionHeaderProps>(({
  japaneseText,
  englishText,
  titleClassName,
}) => {
  return (
    <h2 className={titleClassName}>
      <span lang="ja">{japaneseText} •</span>
      <span lang="en"> {englishText}</span>
    </h2>
  );
});

SectionHeader.displayName = "SectionHeader";
export default SectionHeader;