import Image from "next/image"
import Link from "next/link"
import {
  Star,
  UtensilsCrossed,
  Mountain,
  Sparkles,
  ArrowRight,
  Flame,
  Leaf,
  Compass,
  Bath,
  MapPin,
  Sunrise,
  Sun,
  Moon,
  Snowflake,
  Wind,
  Plane,
  Car,
  Waves,
  MessageCircle,
  Quote,
} from "lucide-react"
import {
  getFeaturedRooms,
  getApprovedReviews,
  getReviewStats,
  getOffers,
  getGallery,
  getExperiences,
  getAttractions,
} from "@/lib/data"
import { RoomCard } from "@/components/site/room-card"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { QuickBook } from "@/components/site/quick-book"
import { Button } from "@/components/ui/button"
import { money } from "@/lib/format"

export default async function HomePage() {
  const [rooms, reviews, stats, offers, gallery, experiences, attractions] = await Promise.all([
    getFeaturedRooms(),
    getApprovedReviews(3),
    getReviewStats(),
    getOffers(),
    getGallery(),
    getExperiences(),
    getAttractions(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-dvh items-end overflow-hidden">
        <Image
          src="/images/hero-himalaya.png"
          alt="Hotel Tukuche Peak beneath the Himalayan peaks at golden hour"
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-40 sm:pb-24">
          <Reveal>
            <p className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.3em] text-white/90">
              <Mountain className="size-4" /> Tukuche · Mustang · Nepal
            </p>
            <h1 className="max-w-4xl text-balance font-display text-5xl font-semibold leading-[1.02] text-white drop-shadow-lg sm:text-7xl">
              Luxury in the heart of the Himalayas
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/85 sm:text-xl">
              A boutique retreat where glass-walled suites open onto the Dhaulagiri massif, and every stay is measured in
              sunrises.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <QuickBook />
          </Reveal>
          <Reveal delay={0.3} className="mt-8">
            <div className="glass-sheer glass-reflect flex w-fit flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl px-5 py-3 text-white/90">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Star className="size-4 fill-accent text-accent" /> {stats.avg.toFixed(1)} guest rating
              </span>
              <span className="hidden h-4 w-px bg-white/30 sm:block" />
              <span className="text-sm font-medium">Altitude 2,590m</span>
              <span className="hidden h-4 w-px bg-white/30 sm:block" />
              <span className="text-sm font-medium">Est. on the old salt road</span>
            </div>
          </Reveal>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 sm:flex">
          <span className="text-[0.7rem] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-10 w-px animate-pulse bg-white/50" />
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="A rare address"
              title="Where the mountains meet quiet luxury"
              description="Perched in the historic trading village of Tukuche, our hotel blends refined boutique hospitality with authentic Himalayan warmth. Heated stone floors, alpine linen, brushed brass, and floor-to-ceiling glass frame the deepest gorge on earth."
            />
            <p className="mt-6 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              We are a house of just a handful of rooms, staffed by people who grew up in these mountains. Expect
              first-name welcomes, butter tea at altitude, and a stillness you will carry home.
            </p>
            <div className="mt-10 flex flex-wrap gap-10">
              <Stat value={`${stats.avg.toFixed(1)}`} label="Guest rating" icon={<Star className="size-4" />} />
              <Stat value={`${rooms.length * 4}+`} label="Curated rooms" icon={<Mountain className="size-4" />} />
              <Stat value="24/7" label="Concierge" icon={<Sparkles className="size-4" />} />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass glass-reflect overflow-hidden rounded-3xl">
              <Image
                src="/images/gallery/lounge.png"
                alt="The glass lounge and fireplace"
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Wellness & spa */}
      <section className="relative overflow-hidden py-8 sm:py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="glass glass-reflect overflow-hidden rounded-3xl">
              <Image
                src="/images/gallery/spa.png"
                alt="The Himalayan spa with hot-stone therapy rooms overlooking the peaks"
                width={900}
                height={700}
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <SectionHeading
              eyebrow="Wellness"
              title="Restoration at altitude"
              description="Our spa is a sanctuary of warm stone and mountain silence. Hot-stone therapies, singing-bowl sound baths, and herbal treatments drawn from Himalayan botanicals ease the body after a day on the trail."
            />
            <ul className="mt-8 grid gap-4">
              {wellness.map((w) => (
                <li key={w.title} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    {w.icon}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{w.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Amenities — the art of the stay */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="The art of the stay"
            title="Considered in every detail"
            align="center"
            description="From the moment you arrive to the last sunrise, a quiet choreography of comfort surrounds you."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.08}>
              <div className="glass glass-reflect flex h-full flex-col gap-4 rounded-3xl p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">{a.icon}</span>
                <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured rooms */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Stay" title="Rooms & suites" />
            <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
              <Link href="/rooms">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <Reveal key={room.id} delay={i * 0.08}>
              <RoomCard room={room} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cinematic statement */}
      <section className="relative my-8 flex min-h-[70vh] items-center overflow-hidden sm:my-16">
        <Image
          src="/images/home-statement.png"
          alt="Dawn over the Dhaulagiri massif"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/25 to-background/50" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="glass glass-reflect mx-auto rounded-3xl px-8 py-12 sm:px-14 sm:py-16">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-foreground">Eight thousand metres</p>
              <blockquote className="mt-6 text-balance font-display text-3xl font-semibold leading-tight sm:text-5xl">
                “You do not simply see the mountains here. You live inside them.”
              </blockquote>
              <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                Between Dhaulagiri and Annapurna — two of the world&apos;s fourteen eight-thousanders — the Kali Gandaki
                carves the deepest gorge on earth. Our windows open onto all of it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Restaurant teaser */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-stretch gap-0 overflow-hidden rounded-3xl px-6 lg:grid-cols-2 lg:px-0">
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl lg:rounded-r-none">
            <Image src="/images/restaurant.png" alt="Alpine dining room at golden hour" fill className="object-cover" />
          </div>
          <div className="glass glass-reflect flex flex-col justify-center gap-5 rounded-3xl p-10 lg:rounded-l-none">
            <SectionHeading
              eyebrow="Dine"
              title="Authentic Thakali, elevated"
              description="Our kitchen celebrates Mustang's culinary heritage — from the classic Thakali dal bhat to pan-seared river trout — served against a backdrop of snow-capped peaks."
            />
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><UtensilsCrossed className="size-4 text-accent" /> Farm-to-table Mustang produce</li>
              <li className="flex items-center gap-2"><Leaf className="size-4 text-accent" /> Vegetarian, vegan &amp; gluten-free menus</li>
              <li className="flex items-center gap-2"><Flame className="size-4 text-accent" /> Wood-fired breads &amp; hot butter tea</li>
            </ul>
            <div>
              <Button asChild className="rounded-xl">
                <Link href="/restaurant">
                  <UtensilsCrossed className="size-4" /> Explore the menu
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* A day at Tukuche Peak */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="A day in the valley"
            title="From first light to last ember"
            align="center"
            description="Every hour at Tukuche Peak has its own colour. This is how a day unfolds beneath the massif."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dayMoments.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.1}>
              <article className="group glass glass-reflect glass-hover flex h-full flex-col overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={m.image}
                    alt={m.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full glass-strong px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
                    {m.icon} {m.time}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Reveal>
            <SectionHeading eyebrow="Packages" title="Curated offers" align="center" />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {offers.slice(0, 3).map((o: any, i: number) => (
              <Reveal key={o.id} delay={i * 0.08}>
                <div className="glass glass-reflect flex h-full flex-col rounded-3xl p-6">
                  <span className="w-fit rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                    {o.discount_pct}% off
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold">{o.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{o.description}</p>
                  <Button asChild variant="ghost" className="mt-4 w-fit px-0 hover:bg-transparent">
                    <Link href="/offers">
                      View offer <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Experiences */}
      {experiences.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Reveal>
            <SectionHeading eyebrow="Do" title="Himalayan experiences" />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {experiences.slice(0, 3).map((e: any, i: number) => (
              <Reveal key={e.id} delay={i * 0.08}>
                <Link href="/experiences" className="group block overflow-hidden rounded-3xl glass glass-reflect">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={e.image || "/images/experiences.png"}
                      alt={e.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{e.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* The setting — attractions */}
      {attractions.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <SectionHeading
                eyebrow="The setting"
                title="A landscape without equal"
                description="Step beyond the door into a valley of apple orchards, glacial rivers, and trading-route history — all within reach of the hotel."
              />
              <Button asChild variant="ghost" className="mt-6 w-fit px-0 hover:bg-transparent">
                <Link href="/experiences">
                  Explore the area <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Reveal>
            <div className="grid gap-4">
              {attractions.slice(0, 3).map((a: any, i: number) => (
                <Reveal key={a.id} delay={i * 0.08}>
                  <div className="glass glass-reflect flex items-center gap-5 overflow-hidden rounded-3xl p-3">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl">
                      <Image src={a.image || "/images/experiences.png"} alt={a.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent-foreground">
                        <MapPin className="size-3.5" /> {a.distance}
                      </div>
                      <h3 className="mt-1 font-display text-lg font-semibold">{a.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seasons — when to visit */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="When to visit"
            title="Four seasons on the roof of the world"
            description="Tukuche wears each season differently. Whenever you come, the mountains will be waiting."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seasons.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.08}>
              <div className="glass glass-reflect glass-hover flex h-full flex-col gap-3 rounded-3xl p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">{s.icon}</span>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.months}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Guests"
              title={`Rated ${stats.avg.toFixed(1)} by ${stats.count} guests`}
              align="center"
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((r: any, i: number) => (
              <Reveal key={r.id} delay={i * 0.08}>
                <figure className="glass glass-reflect flex h-full flex-col rounded-3xl p-6">
                  <div className="flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={s < r.rating ? "size-4 fill-current" : "size-4 opacity-30"} />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                    “{r.body}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-medium">{r.guest_name}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Heritage story */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="glass glass-reflect overflow-hidden rounded-3xl">
              <Image
                src="/images/heritage.png"
                alt="Tukuche heritage trading-era architecture"
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <SectionHeading
              eyebrow="Our story"
              title="Rooted in the old salt road"
              description="Tukuche was once the richest trading town on the trans-Himalayan salt route, where Tibetan caravans met Nepali merchants. Our hotel occupies a restored trading house, its timber and stone preserved and reimagined for a new kind of traveller."
            />
            <p className="mt-6 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              We work with local artisans, source from valley farms, and reinvest in the community that makes this place
              what it is — so that luxury here always means belonging, never intrusion.
            </p>
            <Button asChild variant="outline" className="mt-8 rounded-xl">
              <Link href="/about">Read our full story</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Gallery strip */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading eyebrow="See" title="A glimpse of Tukuche Peak" />
              <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
                <Link href="/gallery">
                  Full gallery <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, 8).map((g: any, i: number) => (
              <Reveal key={g.id} delay={i * 0.05}>
                <div className="glass overflow-hidden rounded-2xl">
                  <Image
                    src={g.url || "/placeholder.svg"}
                    alt={g.caption ?? "Hotel Tukuche Peak"}
                    width={500}
                    height={500}
                    className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Location — getting here */}
      <section className="relative my-8 flex min-h-[70vh] items-center overflow-hidden sm:my-12">
        <Image src="/images/gallery/valley.png" alt="The Kali Gandaki valley approach to Tukuche" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/55 to-background/20" />
        <div className="relative mx-auto w-full max-w-6xl px-6">
          <div className="max-w-xl">
            <Reveal>
              <SectionHeading
                eyebrow="Finding us"
                title="Deep in the Kali Gandaki gorge"
                description="Set in the trading village of Tukuche, between Jomsom and Marpha, the hotel sits on the historic trans-Himalayan salt route — remote, yet remarkably reachable."
              />
            </Reveal>
            <div className="mt-8 grid gap-3">
              {journey.map((j, i) => (
                <Reveal key={j.label} delay={i * 0.08}>
                  <div className="glass glass-reflect flex items-center gap-4 rounded-2xl p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      {j.icon}
                    </span>
                    <div>
                      <h3 className="font-medium">{j.label}</h3>
                      <p className="text-sm text-muted-foreground">{j.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <Button asChild variant="outline" className="mt-8 rounded-xl">
                <Link href="/contact">
                  <MapPin className="size-4" /> Directions &amp; contact
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* AI Concierge teaser */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <Reveal>
          <div className="glass glass-reflect relative overflow-hidden rounded-3xl p-10 sm:p-14">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  <Sparkles className="size-4" /> Always on
                </p>
                <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
                  Meet your Himalayan concierge
                </h2>
                <p className="mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
                  Ask about rooms, dining, availability, or how to plan your days in the valley. Our AI concierge answers
                  instantly, at any hour — and connects you to our team whenever you&apos;d like a human touch.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-xl">
                    <Link href="/book">Plan my stay</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl">
                    <Link href="/contact">
                      <MessageCircle className="size-4" /> Talk to us
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="glass-strong glass-reflect animate-float-slow grid size-40 place-items-center rounded-[2rem]">
                  <Sparkles className="size-16 text-accent" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="glass-strong glass-reflect relative overflow-hidden rounded-3xl p-10 text-center sm:p-16">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-5xl">
              Your Himalayan escape awaits
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Reserve your stay from {money(rooms[rooms.length - 1]?.price ?? 220)} per night and wake to the roof of the
              world.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/book">Book your stay</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/rooms">Browse rooms</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

const amenities = [
  {
    title: "Himalayan spa rituals",
    description: "Hot-stone therapies and herbal treatments to soothe body and altitude, overlooking the peaks.",
    icon: <Bath className="size-6" />,
  },
  {
    title: "Farm-to-table dining",
    description: "Seasonal Thakali cuisine and wood-fired breads made from valley-grown produce.",
    icon: <UtensilsCrossed className="size-6" />,
  },
  {
    title: "Private trek concierge",
    description: "Expert local guides curate walks from gentle orchard loops to the Dhaulagiri icefall.",
    icon: <Compass className="size-6" />,
  },
  {
    title: "Heated glass suites",
    description: "Underfloor warmth, alpine linen, and floor-to-ceiling glass framing the massif.",
    icon: <Flame className="size-6" />,
  },
]

const wellness = [
  {
    title: "Hot-stone therapy",
    description: "River stones warmed over embers melt away the strain of the trail.",
    icon: <Flame className="size-5" />,
  },
  {
    title: "Singing-bowl sound baths",
    description: "Himalayan bowls tuned to the valley's stillness for deep rest.",
    icon: <Waves className="size-5" />,
  },
  {
    title: "Herbal botanical rituals",
    description: "Treatments blended from juniper, sea buckthorn, and mountain herbs.",
    icon: <Leaf className="size-5" />,
  },
]

const dayMoments = [
  {
    time: "Dawn",
    title: "Sunrise on Dhaulagiri",
    description: "Wake as the first light turns the massif to gold, butter tea in hand.",
    image: "/images/gallery/breakfast-terrace.png",
    icon: <Sunrise className="size-3.5" />,
  },
  {
    time: "Midday",
    title: "Orchard & valley walks",
    description: "Wander apple orchards and the old salt road with a local guide.",
    image: "/images/gallery/mountain-path.png",
    icon: <Sun className="size-3.5" />,
  },
  {
    time: "Dusk",
    title: "Fireside & Thakali feast",
    description: "Gather by the hearth for wood-fired breads and highland trout.",
    image: "/images/gallery/fireplace-lounge.png",
    icon: <Flame className="size-3.5" />,
  },
  {
    time: "Night",
    title: "A sky full of stars",
    description: "Under some of the clearest night skies on earth, far from any city.",
    image: "/images/gallery/exterior-dusk.png",
    icon: <Moon className="size-3.5" />,
  },
]

const seasons = [
  {
    name: "Spring",
    months: "Mar–May",
    description: "Rhododendron blooms, mild days, and crisp, clear mountain views.",
    icon: <Leaf className="size-6" />,
  },
  {
    name: "Summer",
    months: "Jun–Aug",
    description: "Lush valleys in the rain shadow — Mustang stays dry when Nepal is wet.",
    icon: <Sun className="size-6" />,
  },
  {
    name: "Autumn",
    months: "Sep–Nov",
    description: "The classic trekking season: golden light and pin-sharp horizons.",
    icon: <Wind className="size-6" />,
  },
  {
    name: "Winter",
    months: "Dec–Feb",
    description: "Snow-dusted peaks, roaring fires, and the valley at its most serene.",
    icon: <Snowflake className="size-6" />,
  },
]

const journey = [
  {
    label: "Fly to Pokhara",
    detail: "A short scenic flight from Kathmandu to the lakeside city.",
    icon: <Plane className="size-5" />,
  },
  {
    label: "Pokhara to Jomsom",
    detail: "A spectacular mountain flight into the heart of Mustang.",
    icon: <Plane className="size-5" />,
  },
  {
    label: "Jomsom to Tukuche",
    detail: "A 45-minute private transfer along the Kali Gandaki — we arrange it all.",
    icon: <Car className="size-5" />,
  },
]

function Stat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-display text-3xl font-semibold">
        <span className="text-accent">{icon}</span>
        {value}
      </div>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}
