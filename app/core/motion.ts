// motion.ts
// Shared motion tokens for the portfolio and blog surfaces.

export const cinematicEase = [0.16, 1, 0.3, 1] as const;

export const revealVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

export const subtleFadeVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
};

export const staggerContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const fastSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
};
