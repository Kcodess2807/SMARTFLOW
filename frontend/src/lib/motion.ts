// Shared Framer Motion variants. Components additionally call useReducedMotion()
// and skip animation when the user prefers reduced motion; the global CSS media
// query in index.css is the final safety net.
import type { Variants } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

/** Parent that staggers its children's reveals. */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
});

export const VIEWPORT = { once: true, amount: 0.3 } as const;
