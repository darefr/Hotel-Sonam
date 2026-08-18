"use client"

import { type ReactNode } from "react"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { easeLuxe, fadeUp, staggerContainer, viewportOnce } from "@/lib/motion"

/**
 * Single-element scroll reveal. Fades and lifts into place when it enters the
 * viewport. `delay` is preserved from the original API so existing usage keeps
 * working. Respects prefers-reduced-motion via the layout's MotionConfig.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={cn("will-change-[opacity,transform]", className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: easeLuxe, delay }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered container — animates its RevealItem children in sequence.
 * Use for grids, lists and any set of sibling cards.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delayChildren = 0,
  as: Tag = "div",
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
  as?: "div" | "ul" | "section"
}) {
  const MotionTag = motion[Tag]
  return (
    <MotionTag
      className={className}
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  )
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
  as: Tag = "div",
}: {
  children: ReactNode
  className?: string
  variants?: Variants
  as?: "div" | "li" | "article"
}) {
  const MotionTag = motion[Tag]
  return (
    <MotionTag className={cn("will-change-[opacity,transform]", className)} variants={variants}>
      {children}
    </MotionTag>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          {align === "center" && <span className="h-px w-6 bg-accent/60" aria-hidden />}
          {eyebrow}
          <span className="h-px w-6 bg-accent/60" aria-hidden />
        </p>
      )}
      <h2 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  )
}
