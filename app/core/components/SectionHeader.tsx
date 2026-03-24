"use client";

/*
 * File: SectionHeader.tsx
 * Author: Ahmed Emad Nasr
 * Purpose: Reusable bilingual section heading renderer with optional motion props
 */

import React, { memo } from "react";
import { motion, MotionProps } from "framer-motion";

interface SectionHeaderProps {
  japaneseText: string;
  englishText: string;
  titleClassName: string;
  japaneseMotionProps?: MotionProps;
  englishMotionProps?: MotionProps;
}

const SectionHeader = memo<SectionHeaderProps>(({
  japaneseText,
  englishText,
  titleClassName,
  japaneseMotionProps,
  englishMotionProps,
}) => {
  return (
    <h2 className={titleClassName}>
      {japaneseMotionProps ? (
        <motion.span lang="ja" {...japaneseMotionProps}>
          {japaneseText} •
        </motion.span>
      ) : (
        <span lang="ja">{japaneseText} •</span>
      )}
      {englishMotionProps ? (
        <motion.span lang="en" {...englishMotionProps}>
          {" "}
          {englishText}
        </motion.span>
      ) : (
        <span lang="en"> {englishText}</span>
      )}
    </h2>
  );
});

SectionHeader.displayName = "SectionHeader";
export default SectionHeader;