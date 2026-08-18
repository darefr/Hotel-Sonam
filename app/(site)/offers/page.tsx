import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getOffers } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { Tag, CalendarCheck, BadgePercent, Sparkles, Check, Coffee, Car, ConciergeBell } from "lucide-react"

export const metadata: Metadata = {
  title: "Offers & Packages",
  description:
    "Seasonal offers and curated packages at Hotel Tukuche Peak — honeymoon escapes, trekker's basecamp, family orchard getaways, and long-stay serenity.",
}

export const dynamic = "force-dynamic"

const steps = [
  { icon: <Sparkles className="size-5" />, title: "Choose a package", body: "Pick the offer that fits your journey — romance, adventure, family, or slow travel." },
  { icon: <BadgePercent className="size-5" />, title: "Apply the code", body: "Enter the offer code at booking and watch the savings apply instantly." },
  { icon: <CalendarCheck className="size-5" />, title: "Arrive & unwind", body: "We handle the rest — transfers, dining, and experiences arranged before you land." },
]

export default async function OffersPage() {
  const offers = await getOffers()
  return (
    <>
      <PageHero
        eyebrow="Packages"
        title="Stays worth the journey"
        description="Thoughtfully designed packages for every kind of traveller — from honeymooners to Annapurna trekkers."
        image="/images/gallery/breakfast-terrace.png"
        imageAlt="Breakfast on a sunlit terrace overlooking the Himalayas"
      />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-20">
      <Reveal>
        <SectionHeading
          eyebrow="Curated offers"
          title="Find your reason to stay"
          description="Every package includes daily breakfast, concierge planning, and our signature Himalayan welcome."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {offers.map((o: any, i: number) => (
          <Reveal key={o.id} delay={i * 0.06}>
            <div className="glass glass-reflect flex h-full flex-col overflow-hidden rounded-3xl md:flex-row">
              <div className="relative min-h-[180px] md:w-2/5">
                <Image src={o.image || "/images/room-suite.png"} alt={o.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                  <Tag className="size-3" /> {o.discount_pct}% off
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold">{o.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{o.description}</p>
                {o.code && (
                  <p className="mt-3 text-sm">
                    Use code{" "}
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono font-semibold text-primary">
                      {o.code}
                    </span>
                  </p>
                )}
                <Button asChild className="mt-5 w-fit rounded-xl">
                  <Link href="/book">Book this offer</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* How it works */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading eyebrow="Simple booking" title="How our offers work" align="center" />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="glass glass-reflect flex h-full flex-col gap-3 rounded-3xl p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">{s.icon}</span>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Included with every stay */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Always included"
            title="Every package comes with more"
            description="No matter which offer you choose, these signatures of a Tukuche Peak stay are always part of the welcome."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.06}>
              <div className="glass glass-reflect glass-hover flex h-full flex-col gap-3 rounded-3xl p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">{b.icon}</span>
                <h3 className="font-display font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Terms */}
      <section className="mt-20">
        <Reveal>
          <div className="glass glass-reflect rounded-3xl p-8 sm:p-10">
            <h3 className="font-display text-lg font-semibold">Good to know</h3>
            <ul className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {terms.map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Booking CTA */}
      <section className="mt-20">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">Ready when you are</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Apply any offer code at checkout, or let our concierge tailor a package to your dates and plans.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/book">Book a stay</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/contact">Ask the concierge</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
      </div>
    </>
  )
}

const benefits = [
  {
    icon: <Coffee className="size-5" />,
    title: "Daily breakfast",
    description: "A mountain breakfast on the terrace, included every morning.",
  },
  {
    icon: <Car className="size-5" />,
    title: "Airport transfers",
    description: "Private Jomsom transfers arranged around your flights.",
  },
  {
    icon: <ConciergeBell className="size-5" />,
    title: "Concierge planning",
    description: "A dedicated host to plan your days in the valley.",
  },
  {
    icon: <Sparkles className="size-5" />,
    title: "Himalayan welcome",
    description: "Butter tea, a warm towel, and a room readied for sunrise.",
  },
]

const terms = [
  "Offer codes apply to the room rate and cannot be combined with other promotions.",
  "Packages are subject to availability for your selected dates.",
  "Free cancellation up to 7 days before arrival on most rates.",
  "Rates are per room, per night, and include applicable taxes.",
  "Seasonal packages may require a minimum length of stay.",
  "Children and additional guests can be arranged with the concierge.",
]
