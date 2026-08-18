"use client"

import type { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * App-wide theme provider (light / dark) backed by next-themes.
 * - attribute="class" toggles the `.dark` class the design tokens key off.
 * - defaultTheme="system" respects the visitor's OS preference on first visit.
 * - enableSystem + disableTransitionOnChange avoids a flash while the class swaps;
 *   our own CSS handles the smooth colour transition after mount.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
