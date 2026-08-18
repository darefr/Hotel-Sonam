import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getRooms } from "@/lib/data"
import { RoomCard } from "@/components/site/room-card"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { BedDouble, Flame, Wifi, Mountain, Bath, Coffee, Sparkles, Leaf, ConciergeBell } from "lucide-react"

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description:
    "Explore refined rooms and suites at Hotel Tukuche Peak — glass-walled panorama suites, deluxe kings, and family lofts with Himalayan views.",
}

export const dynamic = "force-dynamic"

const experience = [
  {
    icon: <Sparkles className="size-5" />,
    title: "A turndown ritual",
    description: "Butter tea, local honey, and a hot water bottle tucked in each evening.",
  },
  {
    icon: <Leaf className="size-5" />,
    title: "Natural materials",
    description: "Hand-woven wool, alpine timber, and brushed brass throughout every room.",
  },
  {
    icon: <ConciergeBell className="size-5" />,
    title: "Attentive, unobtrusive service",
    description: "A dedicated host for your stay, from arrival transfer to departure.",
  },
]

const inRoom = [
  { icon: <Mountain className="size-5" />, label: "Panoramic mountain views" },
  { icon: <Flame className="size-5" />, label: "Heated stone floors" },
  { icon: <BedDouble className="size-5" />, label: "Alpine linen & down bedding" },
  { icon: <Bath className="size-5" />, label: "Rainfall showers & soaking tubs" },
  { icon: <Wifi className="size-5" />, label: "High-speed Wi-Fi throughout" },
  { icon: <Coffee className="size-5" />, label: "In-room tea & coffee service" },
]

export default async function RoomsPage() {
  const rooms = await getRooms()
  return (
    <>
      <PageHero
        eyebrow="Stay"
        title="Rooms & suites framed by the Himalayas"
        description="From the crown-jewel Glacier Panorama Suite to the intimate Alpine Twin, every room is composed around the mountains."
        image="/images/gallery/suite-interior.png"
        imageAlt="Luxury suite interior with floor-to-ceiling glass overlooking the Himalayas"
      />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Choose your view"
            title="A room for every kind of traveller"
            description="Whether you seek a honeymoon retreat, a trekker's basecamp, or space for the whole family, each room delivers the same quiet luxury."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <Reveal key={room.id} delay={i * 0.06}>
              <RoomCard room={room} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* The stay experience */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="glass glass-reflect overflow-hidden rounded-3xl">
              <Image
                src="/images/rooms/glacier-suite-1.png"
                alt="The Glacier Panorama Suite with floor-to-ceiling glass framing the massif"
                width={900}
                height={700}
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <SectionHeading
              eyebrow="The stay experience"
              title="More than a room — a private vantage on the Himalayas"
              description="Each room is composed around the view, then layered with quiet comfort: underfloor heating warmed against the alpine chill, hand-woven textiles, and a turndown of butter tea and local honey."
            />
            <ul className="mt-8 grid gap-4">
              {experience.map((e) => (
                <li key={e.title} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    {e.icon}
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{e.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Suite spotlight */}
      <section className="relative my-8 flex min-h-[70vh] items-center overflow-hidden sm:my-12">
        <Image
          src="/images/rooms/glacier-suite-2.png"
          alt="Evening in the Glacier Panorama Suite"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/75 via-background/30 to-background/50" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <div className="glass-strong glass-reflect mx-auto rounded-3xl px-8 py-12 sm:px-14 sm:py-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The crown jewel</p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold sm:text-4xl">
                The Glacier Panorama Suite
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                Our signature suite wraps two walls in glass, opening onto Dhaulagiri and the Kali Gandaki gorge. A
                private soaking tub, a fireside sitting room, and a bed positioned for sunrise make it the most requested
                room in the house.
              </p>
              <Button asChild className="mt-8 rounded-xl">
                <Link href="/book">Reserve the suite</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* In every room */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow="In every room" title="Comfort, considered" align="center" />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inRoom.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.06}>
              <div className="glass glass-reflect flex items-center gap-4 rounded-2xl p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  {f.icon}
                </span>
                <span className="font-medium">{f.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
              Not sure which room is right?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Our concierge will help you choose the perfect room for your dates, group, and plans in the valley.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/book">Check availability</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/contact">Ask the concierge</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
