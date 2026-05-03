// motion.ts
// Shared motion tokens for the portfolio and blog surfaces.

export const cinematicEase = [0.25, 0.1, 0.25, 1] as const;

export const cinematicDurations = {
  short: 0.55,
  medium: 0.75,
  long: 0.95,
} as const;

export const revealVariants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: cinematicDurations.medium,
      ease: cinematicEase,
    },
  },
};

export const subtleFadeVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: cinematicDurations.short,
      ease: cinematicEase,
    },
  },
};

export const staggerContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.14,
    },
  },
};

export const fastSpring = {
  type: "spring" as const,
  stiffness: 180,
  damping: 26,
};
