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

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "backOut" } },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0,  transition: easeOutCubic },
  exit:    { opacity: 0, y: 8,  transition: { duration: 0.25 } },
};

export const cardHover: Variants = {
  rest:  { y: 0,  boxShadow: "0 1px 3px rgba(0,0,0,0.4)" },
  hover: { y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transition: { duration: 0.25 } },
};

export const buttonPress = {
  tap: { scale: 0.96, transition: { duration: 0.1 } },
};

export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "backOut" } },
  exit:    { opacity: 0, scale: 0.94, transition: { duration: 0.2 } },
};
