"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { forwardRef } from "react";

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.9 },
};

// Common transition configs
export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const quickSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.2,
  ease: "easeOut" as const,
};

// Reusable animated components
interface AnimatedDivProps extends HTMLMotionProps<"div"> {
  variant?: "fadeInUp" | "fadeIn" | "scaleIn" | "slideUp";
}

export const AnimatedDiv = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ variant = "fadeInUp", children, ...props }, ref) => {
    const variants = {
      fadeInUp,
      fadeIn,
      scaleIn,
      slideUp,
    }[variant];

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={smoothTransition}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedDiv.displayName = "AnimatedDiv";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  scaleOnHover?: boolean;
  scaleOnTap?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ scaleOnHover = true, scaleOnTap = true, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={scaleOnHover ? { scale: 1.05 } : undefined}
        whileTap={scaleOnTap ? { scale: 0.95 } : undefined}
        transition={springTransition}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

interface BadgeProps extends HTMLMotionProps<"div"> {}

export const AnimatedBadge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={quickSpring}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedBadge.displayName = "AnimatedBadge";
