"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "framer-motion"

/**
 * Global motion configuration. `reducedMotion="user"` makes every Framer Motion
 * animation across the app automatically respect the user's OS-level
 * prefers-reduced-motion setting.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  )
}
