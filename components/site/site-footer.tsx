import Link from "next/link"
import { Mountain, Mail, MapPin, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const explore = [
  { href: "/rooms", label: "Rooms & Suites" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/offers", label: "Offers" },
  { href: "/experiences", label: "Experiences" },
  { href: "/gallery", label: "Gallery" },
]

const guests = [
  { href: "/book", label: "Book a stay" },
  { href: "/account", label: "My account" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Sign in" },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      {/* Brass hairline accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 font-display text-xl font-semibold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Mountain className="size-4" aria-hidden />
            </span>
            Hotel Tukuche Peak
          </div>
          <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            A boutique luxury retreat in the historic village of Tukuche, cradled between the Dhaulagiri and Annapurna
            massifs in Mustang, Nepal.
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Tukuche, Mustang, Nepal
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> hotelsonam@gmail.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> +977 985-1019065
            </p>
          </div>
          <Button asChild className="mt-7 rounded-full shimmer">
            <Link href="/book">
              Book your stay <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline inline-block transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-foreground/70">Guests</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {guests.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline inline-block transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Hotel Tukuche Peak. All rights reserved.</p>
          <p className="flex items-center gap-1.5 uppercase tracking-[0.16em]">
            <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
            Crafted in the heart of the Himalayas
          </p>
        </div>
      </div>
    </footer>
  )
}
