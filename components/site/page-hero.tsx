"use client"

import Image from "next/image"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { easeLuxe, staggerContainer } from "@/lib/motion"

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  align = "left",
}: {
  eyebrow?: string
  title: string
  description?: string
  image: string
  imageAlt: string
  align?: "left" | "center"
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  // Gentle parallax: image drifts up and fades slightly as the hero scrolls away.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.55])

  const item = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeLuxe } },
  }

  return (
    <section ref={ref} className="relative flex min-h-[60vh] items-end overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="animate-ken-burns object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
      <motion.div
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="show"
        className={"relative mx-auto w-full max-w-6xl px-6 pb-14 pt-40 " + (align === "center" ? "text-center" : "")}
      >
        {eyebrow ? (
          <motion.p
            variants={item}
            className={
              "mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/90 " +
              (align === "center" ? "mx-auto" : "")
            }
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h1
          variants={item}
          className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-white drop-shadow-lg sm:text-6xl"
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p
            variants={item}
            className={
              "mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/85 " +
              (align === "center" ? "mx-auto" : "")
            }
          >
            {description}
          </motion.p>
        ) : null}
      </motion.div>
    </section>
  )
}
