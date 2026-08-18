import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getExperiences, getAttractions } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { money } from "@/lib/format"
import { Clock, MapPin, Mountain, Compass, Sunrise, Footprints } from "lucide-react"

export const metadata: Metadata = {
  title: "Experiences & Attractions",
  description:
    "Curated Himalayan experiences and nearby attractions — sunrise viewpoints, Thakali culinary journeys, apple orchards, and the Kali Gandaki gorge.",
}

export const dynamic = "force-dynamic"

export default async function ExperiencesPage() {
  const [experiences, attractions] = await Promise.all([getExperiences(), getAttractions()])

  return (
    <>
      <PageHero
        eyebrow="Do"
        title="Himalayan experiences, curated for you"
        description="From pre-dawn summits to orchard tastings, our team curates the moments that make a Mustang stay unforgettable."
        image="/images/gallery/mountain-path.png"
        imageAlt="A trekking trail through the Kali Gandaki valley near Tukuche"
      />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-20">
      <Reveal>
        <SectionHeading
          eyebrow="Signature"
          title="Ways to spend your days"
          description="Every experience is led by a local guide who knows these valleys intimately. All can be arranged at the concierge desk."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((e: any, i: number) => (
          <Reveal key={e.id} delay={i * 0.06}>
            <article className="glass glass-reflect flex h-full flex-col overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3]">
                <Image src={e.image || "/images/experiences.png"} alt={e.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold">{e.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {e.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" /> {e.duration}
                    </span>
                  )}
                  {e.difficulty && (
                    <span className="flex items-center gap-1.5">
                      <Mountain className="size-3.5 text-primary" /> {e.difficulty}
                    </span>
                  )}
                  {Number(e.price) > 0 && <span className="font-medium text-primary">{money(e.price)}</span>}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Storytelling band */}
      <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="glass glass-reflect overflow-hidden rounded-3xl">
            <Image
              src="/images/experiences.png"
              alt="A guided sunrise walk above the Kali Gandaki"
              width={900}
              height={700}
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <SectionHeading
            eyebrow="Led by locals"
            title="Guides who were born to these valleys"
            description="Our guides grew up walking the salt road. They know which ridge catches the first light, which orchard is ripe, and which teahouse pours the best butter tea. Every experience is theirs to share."
          />
          <ul className="mt-8 grid gap-4">
            {ethos.map((e) => (
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

      {attractions.length > 0 && (
        <div className="mt-24">
          <Reveal>
            <SectionHeading eyebrow="Nearby" title="Attractions around Tukuche" />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {attractions.map((a: any, i: number) => (
              <Reveal key={a.id} delay={i * 0.06}>
                <article className="glass glass-reflect flex h-full flex-col overflow-hidden rounded-3xl">
                  <div className="relative aspect-[4/3]">
                    <Image src={a.image || "/images/gallery/valley.png"} alt={a.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
                    {a.distance && (
                      <span className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-primary" /> {a.distance}
                      </span>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="mt-24">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
              Let us craft your days in the valley
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Tell us how you like to travel and our concierge will shape an itinerary — gentle or ambitious — around
              your stay.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/book">Plan my stay</Link>
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

const ethos = [
  {
    icon: <Sunrise className="size-5" />,
    title: "Timed to the light",
    description: "We plan each outing around the mountain's best hours.",
  },
  {
    icon: <Footprints className="size-5" />,
    title: "Your pace, your way",
    description: "From gentle orchard loops to ambitious ridge walks.",
  },
  {
    icon: <Compass className="size-5" />,
    title: "Stories along the way",
    description: "History, botany, and legend shared by those who live it.",
  },
]
