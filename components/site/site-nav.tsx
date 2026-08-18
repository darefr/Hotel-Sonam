"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Mountain,
  UserRound,
  Sparkles,
  ArrowRight,
  BedDouble,
  UtensilsCrossed,
  Compass,
  Info,
  MessageCircle,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { cn } from "@/lib/utils"
import { easeLuxe, springSoft } from "@/lib/motion"

type NavChild = { href: string; label: string; description: string }
type NavGroup = { id: string; label: string; icon: React.ReactNode; children: NavChild[] }

const groups: NavGroup[] = [
  {
    id: "stay",
    label: "Stay",
    icon: <BedDouble className="size-4" />,
    children: [
      { href: "/rooms", label: "Rooms & Suites", description: "Glass-walled rooms framing the massif" },
      { href: "/offers", label: "Offers & Packages", description: "Curated seasonal escapes" },
      { href: "/book", label: "Book Your Stay", description: "Check availability in moments" },
    ],
  },
  {
    id: "dine",
    label: "Dine",
    icon: <UtensilsCrossed className="size-4" />,
    children: [
      { href: "/restaurant", label: "The Restaurant", description: "Authentic Thakali, elevated" },
      { href: "/restaurant#menu", label: "Our Menu", description: "Farm-to-table Mustang produce" },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    icon: <Compass className="size-4" />,
    children: [
      { href: "/experiences", label: "Experiences", description: "Guided Himalayan journeys" },
      { href: "/gallery", label: "Gallery", description: "The hotel through the seasons" },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: <Info className="size-4" />,
    children: [
      { href: "/about", label: "Our Story", description: "A house among the mountains" },
      { href: "/reviews", label: "Guest Reviews", description: "Voices from our guests" },
      { href: "/contact", label: "Contact", description: "Plan your journey with us" },
    ],
  },
]

const WHATSAPP = "https://wa.me/9779851019065"

function openConcierge() {
  window.dispatchEvent(new CustomEvent("concierge:open"))
}

export function SiteNav({ user }: { user: { name: string; role: string } | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setActiveGroup(null)
  }, [pathname])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  function enterGroup(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveGroup(id)
  }
  function leaveGroup() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setActiveGroup(null), 140)
  }

  const isGroupActive = (g: NavGroup) => g.children.some((c) => pathname === c.href.split("#")[0])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: easeLuxe }}
        onMouseLeave={leaveGroup}
        className={cn(
          "glass-reflect mx-auto flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-6",
          scrolled ? "glass-strong max-w-5xl" : "glass-sheer max-w-6xl",
        )}
        aria-label="Primary"
      >
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.06 }}
            transition={springSoft}
            className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"
          >
            <Mountain className="size-4" aria-hidden />
          </motion.span>
          <span className="hidden leading-none sm:flex sm:flex-col">
            <span className="text-[0.95rem]">Tukuche Peak</span>
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Mustang · Nepal
            </span>
          </span>
        </Link>

        {/* Desktop groups */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {groups.map((g) => (
            <div key={g.id} className="relative" onMouseEnter={() => enterGroup(g.id)}>
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  activeGroup === g.id || isGroupActive(g)
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground",
                )}
                onFocus={() => enterGroup(g.id)}
                aria-expanded={activeGroup === g.id}
                aria-haspopup="true"
              >
                {g.label}
                <motion.span
                  animate={{ rotate: activeGroup === g.id ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: easeLuxe }}
                  className="text-foreground/40"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.span>
                {isGroupActive(g) && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent"
                  />
                )}
              </button>

              <AnimatePresence>
                {activeGroup === g.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.24, ease: easeLuxe }}
                    className="glass-strong glass-reflect absolute left-1/2 top-[calc(100%+0.75rem)] w-72 -translate-x-1/2 rounded-2xl p-2"
                    onMouseEnter={() => enterGroup(g.id)}
                  >
                    {g.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/[0.06]"
                      >
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                          {g.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            {c.label}
                            <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                            {c.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={openConcierge}
            className="glass-interactive hidden items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground xl:inline-flex"
          >
            <Sparkles className="size-4 text-accent" />
            Concierge
          </button>

          {user ? (
            <Button asChild size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link href={user.role === "GUEST" ? "/account" : "/admin"}>
                <UserRound className="size-4" />
                {user.name.split(" ")[0]}
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          {/* Real light/dark toggle — desktop & tablet */}
          <ThemeToggle className="hidden sm:grid" />

          <Button asChild size="sm" className="hidden rounded-full shimmer sm:inline-flex">
            <Link href="/book">Book your stay</Link>
          </Button>

          <button
            className="glass-interactive grid size-10 place-items-center rounded-xl border border-border/50 bg-background/40 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="size-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="size-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Mobile full-screen menu */}
      <MobileMenu open={open} setOpen={setOpen} user={user} />
    </header>
  )
}

function MobileMenu({
  open,
  setOpen,
  user,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  user: { name: string; role: string } | null
}) {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } },
    exit: { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
  }
  const item = {
    hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: easeLuxe } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
  }
  const accountHref = user ? (user.role === "GUEST" ? "/account" : "/admin") : "/login"

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dimmed, blurred backdrop — the page stays visible behind the glass. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easeLuxe }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[6px] lg:hidden"
            aria-hidden
          />

          {/* Editorial navigation sheet — anchored to the top-right, self-contained. */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.9 }}
            style={{ transformOrigin: "top right" }}
            className="fixed right-2.5 top-2.5 z-50 w-[92vw] max-w-[420px] lg:hidden"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="glass-strong glass-reflect flex max-h-[86dvh] flex-col overflow-hidden rounded-[1.7rem] border border-border/50 shadow-2xl"
            >
              {/* Compact glass header */}
              <div className="flex items-center justify-between gap-3 border-b border-border/30 px-4 py-3">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Mountain className="size-4" aria-hidden />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="font-display text-[0.95rem] font-semibold tracking-tight">Tukuche Peak</span>
                    <span className="mt-0.5 text-[0.58rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Mustang · Nepal
                    </span>
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <ThemeToggle className="size-11" />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="glass-interactive grid size-11 shrink-0 place-items-center rounded-full border border-border/50 bg-background/40 text-foreground/80 hover:text-foreground"
                  >
                    <X className="size-5" />
                  </motion.button>
                </div>
              </div>

              {/* Editorial navigation groups */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-3"
              >
                {groups.map((g) => (
                  <motion.div key={g.id} variants={item} className="py-2 first:pt-1">
                    <p className="mb-0.5 flex items-center gap-2 px-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-accent">
                      <span className="text-accent/90">{g.icon}</span>
                      {g.label}
                    </p>
                    <div className="flex flex-col">
                      {g.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="group/link flex items-center justify-between rounded-xl py-2.5 pl-1 pr-2 transition-colors hover:bg-foreground/[0.05] active:bg-foreground/[0.08]"
                        >
                          <span className="font-display text-[1.2rem] font-medium leading-tight tracking-tight">
                            {c.label}
                          </span>
                          <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground/70 opacity-0 transition-all duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Actions — one primary CTA, then subtle glass controls. */}
              <motion.div
                variants={item}
                className="space-y-2.5 border-t border-border/30 px-4 pt-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))]"
              >
                <Button asChild size="lg" className="h-12 w-full rounded-2xl text-[0.95rem] shimmer">
                  <Link href="/book" onClick={() => setOpen(false)}>
                    <BedDouble className="size-4" /> Book your stay
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      setOpen(false)
                      setTimeout(openConcierge, 350)
                    }}
                    className="glass-interactive flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-background/30 py-3 text-[0.82rem] font-medium text-foreground/85"
                  >
                    <Sparkles className="size-4 text-accent" /> Concierge
                  </button>
                  <Link
                    href={accountHref}
                    onClick={() => setOpen(false)}
                    className="glass-interactive flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-background/30 py-3 text-[0.82rem] font-medium text-foreground/85"
                  >
                    <UserRound className="size-4 text-primary" /> {user ? "Account" : "Sign in"}
                  </Link>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-interactive flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-background/30 py-3 text-[0.82rem] font-medium text-foreground/85"
                  >
                    <MessageCircle className="size-4 text-primary" /> WhatsApp
                  </a>
                  <a
                    href="tel:+9779851019065"
                    className="glass-interactive flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-background/30 py-3 text-[0.82rem] font-medium text-foreground/85"
                  >
                    <Phone className="size-4 text-primary" /> Call
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
