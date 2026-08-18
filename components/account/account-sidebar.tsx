"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useFormStatus } from "react-dom"
import {
  LayoutDashboard,
  CalendarCheck,
  History,
  Heart,
  Sparkles,
  Star,
  UserRound,
  Settings2,
  Shield,
  MessageCircle,
  LogOut,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/bookings", label: "Upcoming stays", icon: CalendarCheck },
  { href: "/account/history", label: "Booking history", icon: History },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/loyalty", label: "Loyalty", icon: Sparkles },
  { href: "/account/reviews", label: "My reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: UserRound },
  { href: "/account/preferences", label: "Preferences", icon: Settings2 },
  { href: "/account/security", label: "Security", icon: Shield },
  { href: "/account/contact", label: "Contact hotel", icon: MessageCircle },
]

const tierColor: Record<string, string> = {
  Bronze: "text-amber-700",
  Silver: "text-slate-400",
  Gold: "text-amber-400",
  Platinum: "text-cyan-300",
}

export function AccountSidebar({
  user,
}: {
  user: { name: string; email: string; loyaltyTier: string; loyaltyPoints: number }
}) {
  const pathname = usePathname()

  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <div className="glass glass-reflect rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 font-display text-lg font-semibold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-foreground/[0.04] px-3 py-2.5">
          <span className={cn("flex items-center gap-1.5 text-sm font-semibold", tierColor[user.loyaltyTier] ?? "")}>
            <Sparkles className="size-4" /> {user.loyaltyTier}
          </span>
          <span className="text-sm font-medium tabular-nums">{user.loyaltyPoints.toLocaleString()} pts</span>
        </div>
      </div>

      <nav className="glass glass-reflect mt-4 rounded-3xl p-2" aria-label="Guest portal">
        {links.map((l) => {
          const active = pathname === l.href
          const Icon = l.icon
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {l.label}
            </Link>
          )
        })}
        <form action={logoutAction} className="mt-1 border-t border-border/60 pt-1">
          <SignOutButton />
        </form>
      </nav>
    </aside>
  )
}

function SignOutButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="ghost"
      disabled={pending}
      className="w-full justify-start gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </Button>
  )
}
