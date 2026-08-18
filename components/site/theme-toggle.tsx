"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Compact glass light/dark toggle. Reads/writes the app-wide next-themes state,
 * so preference persists and matches the `.dark` tokens. Renders a neutral
 * placeholder until mounted to avoid a hydration mismatch on the icon.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"}
      className={cn(
        "glass-interactive grid size-10 place-items-center rounded-full border border-border/50 bg-background/40 text-foreground/80 hover:text-foreground",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="size-[1.15rem]" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="size-[1.15rem] text-accent" />
            </motion.span>
          )
        ) : (
          <Sun className="size-[1.15rem] opacity-70" />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
