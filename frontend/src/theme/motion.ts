import { Variants, Transition } from "framer-motion";

const easeOutCubic: Transition = { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] };

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOutCubic },
};

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const buttonPress = {
  tap: { scale: 0.96, transition: { duration: 0.1 } },
};
