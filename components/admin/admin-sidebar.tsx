"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ConciergeBell, CalendarDays, BookMarked, BedDouble, UtensilsCrossed,
  Users, Star, Tag, Images, Mountain, ClipboardList, Mail, BarChart3, Shield, Settings,
  Menu, X, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; perm: string }

const NAV: { section: string; items: Item[] }[] = [
  {
    section: "Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "dashboard" },
      { href: "/admin/frontdesk", label: "Front Desk", icon: ConciergeBell, perm: "frontdesk" },
      { href: "/admin/calendar", label: "Calendar", icon: CalendarDays, perm: "calendar" },
      { href: "/admin/bookings", label: "Bookings", icon: BookMarked, perm: "bookings" },
      { href: "/admin/rooms", label: "Rooms", icon: BedDouble, perm: "rooms" },
      { href: "/admin/restaurant", label: "Restaurant", icon: UtensilsCrossed, perm: "restaurant" },
    ],
  },
  {
    section: "Guests",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users, perm: "crm" },
      { href: "/admin/reviews", label: "Reviews", icon: Star, perm: "reviews" },
      { href: "/admin/waitlist", label: "Waitlist", icon: ClipboardList, perm: "waitlist" },
      { href: "/admin/messages", label: "Messages", icon: Mail, perm: "frontdesk" },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/offers", label: "Offers", icon: Tag, perm: "offers" },
      { href: "/admin/gallery", label: "Gallery", icon: Images, perm: "cms" },
      { href: "/admin/experiences", label: "Experiences", icon: Mountain, perm: "cms" },
    ],
  },
  {
    section: "Management",
    items: [
      { href: "/admin/reports", label: "Reports", icon: BarChart3, perm: "reports" },
      { href: "/admin/staff", label: "Staff & Roles", icon: Shield, perm: "__admin" },
      { href: "/admin/settings", label: "Settings", icon: Settings, perm: "__admin" },
    ],
  },
]

export function AdminSidebar({
  perms,
  role,
  name,
}: {
  perms: string[]
  role: string
  name: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isSuperOrAdmin = role === "SUPER_ADMIN" || role === "ADMIN"

  const allow = (perm: string) => (perm === "__admin" ? isSuperOrAdmin : perms.includes(perm))

  const NavContent = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="px-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-sidebar-foreground/50">Tukuche Peak</p>
        <p className="font-serif text-lg text-sidebar-foreground">PMS Console</p>
      </div>
      {NAV.map((group) => {
        const items = group.items.filter((i) => allow(i.perm))
        if (items.length === 0) return null
        return (
          <div key={group.section}>
            <p className="mb-2 px-2 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-sidebar-foreground/40">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      <div className="mt-auto border-t border-sidebar-border pt-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{name}</p>
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-sidebar-foreground/50">
            {role.replace("_", " ")}
          </p>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <span className="font-serif text-base">Tukuche Peak PMS</span>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">{NavContent}</div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar shadow-xl">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5 text-sidebar-foreground" />
              </Button>
            </div>
            {NavContent}
          </div>
        </div>
      ) : null}
    </>
  )
}
