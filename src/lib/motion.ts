export const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export const revealTransition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.8,
} as const;

export const softSpring = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.8,
} as const;
