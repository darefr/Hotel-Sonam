import type { Transition, Variants } from "framer-motion"

/**
 * Unified motion system for Hotel Tukuche Peak.
 * A single set of easings, springs and variants so every animation across the
 * site feels like one coherent, restrained, luxury motion language.
 *
 * All variants respect `prefers-reduced-motion` because Framer Motion's
 * `MotionConfig reducedMotion="user"` (set in the site layout) automatically
 * strips transforms/opacity transitions for users who ask for less motion.
 */

// Signature easing — a soft, expensive-feeling ease-out.
export const easeLuxe = [0.22, 1, 0.36, 1] as const
export const easeInOutLuxe = [0.65, 0, 0.35, 1] as const

export const springSoft: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 }
export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 32 }

// Basic fade-up used for most content reveals.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeLuxe },
  },
}

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeLuxe } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: easeLuxe } },
}

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.75, ease: easeLuxe } },
}

// Container that staggers its children on entrance.
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})

// Word/line reveal for editorial headlines.
export const lineReveal: Variants = {
  hidden: { opacity: 0, y: "40%" },
  show: { opacity: 1, y: "0%", transition: { duration: 0.8, ease: easeLuxe } },
}

// Image mask reveal — content wipes in from the bottom.
export const maskReveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(12% 0% 12% 0% round 1.5rem)", scale: 1.06 },
  show: {
    opacity: 1,
    clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
    scale: 1,
    transition: { duration: 0.9, ease: easeLuxe },
  },
}

// Shared viewport config so reveals trigger consistently.
export const viewportOnce = { once: true, margin: "0px 0px -80px 0px" } as const
