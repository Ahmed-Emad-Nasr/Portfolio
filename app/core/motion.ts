// motion.ts
// Framer Motion animation presets for fast, light UX


export const fadeUp = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
  transition: { duration: 0 },
};

export const fadeIn = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
  transition: { duration: 0 },
};

export const fastSpring = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  duration: 0,
};
