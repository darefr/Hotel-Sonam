import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getSiteInfo, getReviewStats } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { PageHero } from "@/components/site/page-hero"
import { Button } from "@/components/ui/button"
import { Leaf, HeartHandshake, Mountain, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About",
  description:
    "The story of Hotel Tukuche Peak — a restored trading house on the old trans-Himalayan salt road, reimagined as a boutique luxury retreat in Mustang, Nepal.",
}

export const dynamic = "force-dynamic"

const values = [
  {
    icon: <Leaf className="size-6" />,
    title: "Rooted in place",
    body: "We build with local stone and timber, source from valley farms, and let the landscape lead every design decision.",
  },
  {
    icon: <HeartHandshake className="size-6" />,
    title: "Community first",
    body: "Our team is from these mountains. We reinvest in Tukuche and partner with artisans and guides across Mustang.",
  },
  {
    icon: <Mountain className="size-6" />,
    title: "Quiet by design",
    body: "No crowds, no noise — just a handful of rooms and the vast silence of the deepest gorge on earth.",
  },
  {
    icon: <Sparkles className="size-6" />,
    title: "Effortless luxury",
    body: "Heated floors, alpine linen, and anticipatory service, delivered with genuine Himalayan warmth.",
  },
]

const timeline = [
  { year: "18th century", text: "Tukuche flourishes as the richest trading town on the trans-Himalayan salt route." },
  { year: "The old house", text: "A merchant's trading mansion is built from valley stone and Himalayan timber." },
  { year: "Restoration", text: "The house is lovingly restored, its heritage bones preserved and reimagined." },
  { year: "Today", text: "Hotel Tukuche Peak welcomes travellers seeking luxury with a sense of place." },
]

export default async function AboutPage() {
  const [{ about }, stats] = await Promise.all([getSiteInfo(), getReviewStats()])

  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={about?.title ?? "Where the mountains meet quiet luxury"}
        description={
          about?.body ??
          "Perched in the historic trading village of Tukuche, we blend refined boutique hospitality with authentic Himalayan warmth."
        }
        image="/images/heritage.png"
        imageAlt="Historic trading-era architecture in Tukuche, Mustang"
      />

      {/* Intro split */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="A rare address"
              title="Rooted in the old salt road"
              description="Tukuche was once where Tibetan caravans met Nepali merchants. Our hotel occupies a restored trading house — its timber and stone preserved, its spirit reimagined for a new kind of traveller."
            />
            <p className="mt-6 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              We are a house of just a handful of rooms, staffed by people who grew up in these mountains. Expect
              first-name welcomes, butter tea at altitude, and a stillness you will carry home long after you leave.
            </p>
            <div className="mt-10 flex flex-wrap gap-10">
              <Metric value={`${stats.avg.toFixed(1)}`} label="Guest rating" />
              <Metric value="2,590m" label="Elevation" />
              <Metric value="24/7" label="Concierge" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass glass-reflect overflow-hidden rounded-3xl">
              <Image
                src="/images/gallery/fireplace-lounge.png"
                alt="The fireside lounge overlooking the Himalayas"
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow="What we believe" title="Luxury that belongs here" align="center" />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="glass glass-reflect flex h-full flex-col gap-4 rounded-3xl p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">{v.icon}</span>
                <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow="Our heritage" title="Four centuries in the making" align="center" />
        </Reveal>
        <div className="mt-12 space-y-4">
          {timeline.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.06}>
              <div className="glass glass-reflect flex flex-col gap-1 rounded-2xl p-6 sm:flex-row sm:items-center sm:gap-8">
                <span className="w-40 shrink-0 font-display text-lg font-semibold text-primary">{t.year}</span>
                <span className="text-pretty leading-relaxed text-muted-foreground">{t.text}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-16">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">Come and stay a while</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Experience the story for yourself — from heated glass suites to sunrise over the Dhaulagiri massif.
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

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold text-primary">{value}</div>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}
