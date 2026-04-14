// motion.ts
// Framer Motion animation presets for fast, light UX


export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: 0.14 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22 },
};

export const fastSpring = {
  type: "spring",
  stiffness: 420,
  damping: 32,
};
