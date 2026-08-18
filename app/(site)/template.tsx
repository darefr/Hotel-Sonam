"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { easeLuxe } from "@/lib/motion"

/**
 * Route-level enter transition for public site pages. `template.tsx` remounts
 * on every navigation, giving each page an elegant fade + lift entrance.
 * Reduced-motion is respected via the global MotionConfig.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeLuxe }}
    >
      {children}
    </motion.div>
  )
}
