import type { Metadata } from "next"
import Image from "next/image"
import { getMenu, getFeaturedDishes } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { money } from "@/lib/format"
import { whatsappLink } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"
import { Leaf, Star, Coffee, Wine, Flame, UtensilsCrossed } from "lucide-react"

export const metadata: Metadata = {
  title: "Restaurant",
  description:
    "Authentic Thakali cuisine elevated at Hotel Tukuche Peak — dal bhat, buckwheat dhido, pan-seared river trout, and warm butter tea with panoramic mountain views.",
}

export const dynamic = "force-dynamic"

export default async function RestaurantPage() {
  const [menu, featured] = await Promise.all([getMenu(), getFeaturedDishes()])

  return (
    <div className="pt-28">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6">
        <div className="glass glass-reflect grid overflow-hidden rounded-3xl lg:grid-cols-2">
          <div className="relative min-h-[280px]">
            <Image src="/images/restaurant.png" alt="Alpine dining room" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
            <SectionHeading
              eyebrow="Dine at 2,590m"
              title="A table with a view of the roof of the world"
              description="Our kitchen honours Mustang's Thakali heritage with seasonal highland produce, river trout, and time-honoured recipes — served against a living backdrop of snow-capped peaks."
            />
            <div>
              <Button asChild className="rounded-xl">
                <a href={whatsappLink("Hello, I'd like to reserve a table at the restaurant.")} target="_blank" rel="noopener noreferrer">
                  Reserve a table
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The story */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Our kitchen"
              title="Thakali heritage, cooked over open flame"
              description="The Thakali people have fed traders on the salt road for centuries. Our kitchen keeps that tradition alive — grinding buckwheat by hand, tempering dal with wild timur pepper, and searing trout pulled from the Kali Gandaki that morning."
            />
            <p className="mt-6 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              Everything begins in the valley: apples from Marpha orchards, greens from our kitchen garden, and honey
              from hives on the ridge. What cannot be grown here is not on the menu.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              <Stat value="100%" label="Valley sourced" />
              <Stat value="3" label="Generations of cooks" />
              <Stat value="2,590m" label="Dining altitude" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass glass-reflect overflow-hidden rounded-3xl">
              <Image
                src="/images/gallery/dining.png"
                alt="The alpine dining room set for dinner"
                width={900}
                height={700}
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured dishes */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <Reveal>
            <SectionHeading eyebrow="Chef's picks" title="Signature dishes" />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((d: any, i: number) => (
              <Reveal key={d.id} delay={i * 0.06}>
                <div className="glass glass-reflect flex h-full flex-col overflow-hidden rounded-3xl">
                  <div className="relative aspect-[4/3]">
                    <Image src={d.image || "/images/dish-thakali.png"} alt={d.name} fill className="object-cover" />
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full glass-strong px-2.5 py-1 text-xs font-semibold">
                      <Star className="size-3 fill-accent text-accent" /> Featured
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold">{d.name}</h3>
                      <span className="shrink-0 font-medium text-primary">{money(d.price)}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{d.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Full menu */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <SectionHeading eyebrow="The menu" title="Every dish, from dawn to dusk" align="center" />
        </Reveal>
        <div className="mt-12 space-y-12">
          {menu.map((cat: any) => (
            <Reveal key={cat.id}>
              <div>
                <h3 className="font-display text-2xl font-semibold text-primary">{cat.name}</h3>
                <div className="mt-5 divide-y divide-border/60">
                  {cat.items.map((item: any) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {(item.dietary ?? []).map((d: string) => (
                            <span
                              key={d}
                              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary"
                            >
                              <Leaf className="size-2.5" /> {d}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 max-w-md text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="shrink-0 font-medium text-primary">{money(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Dining experiences */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <SectionHeading eyebrow="Beyond the table" title="Ways to dine with us" align="center" />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {diningExperiences.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.08}>
              <div className="glass glass-reflect glass-hover flex h-full flex-col gap-3 rounded-3xl p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">{d.icon}</span>
                <h3 className="font-display text-lg font-semibold">{d.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{d.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">Reserve your table</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Dinner is served nightly from 6:30 PM. Tables by the glass wall fill quickly — reserve ahead to dine with
              the peaks in view.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <a
                  href={whatsappLink("Hello, I'd like to reserve a table at the restaurant.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reserve on WhatsApp
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-primary">{value}</div>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}

const diningExperiences = [
  {
    icon: <Coffee className="size-6" />,
    title: "Sunrise breakfast terrace",
    description: "Butter tea and buckwheat pancakes as the sun crests Dhaulagiri.",
  },
  {
    icon: <UtensilsCrossed className="size-6" />,
    title: "Chef's Thakali table",
    description: "A guided tasting of the valley's dishes, served the traditional way.",
  },
  {
    icon: <Flame className="size-6" />,
    title: "Fireside dinners",
    description: "Wood-fired mains and mulled highland cider beside the hearth.",
  },
  {
    icon: <Wine className="size-6" />,
    title: "Private valley dining",
    description: "A candlelit table for two arranged anywhere on the property.",
  },
]
