import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, VIEWPORT } from "../lib/motion";

interface RevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  /** render as a list-style stagger child (no own viewport trigger) */
  asChild?: boolean;
}

/**
 * Scroll-triggered reveal. Honours prefers-reduced-motion by rendering content
 * statically (no transform/opacity animation) so nothing moves or hides.
 */
export default function Reveal({
  children,
  variants = fadeUp,
  className,
  asChild = false,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  if (asChild) {
    return (
      <motion.div variants={variants} className={className}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}
