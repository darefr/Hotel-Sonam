import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getGallery } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { GalleryGrid } from "@/components/site/gallery-grid"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Gallery",
  description: "A visual journey through Hotel Tukuche Peak — suites, dining, terraces, and the Himalayan landscape.",
}

export const dynamic = "force-dynamic"

const highlights = [
  { image: "/images/gallery/exterior-dusk.png", label: "The house at dusk", caption: "Lantern light against the darkening massif." },
  { image: "/images/gallery/suite-interior.png", label: "Glass-walled suites", caption: "Rooms composed entirely around the view." },
  { image: "/images/gallery/terrace.png", label: "The sun terrace", caption: "Breakfast and butter tea above the valley." },
]

export default async function GalleryPage() {
  const items = await getGallery()
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-32">
      <Reveal>
        <SectionHeading
          eyebrow="See"
          title="A glimpse of Tukuche Peak"
          description="Every corner of the hotel is composed around the mountains. Explore the spaces, the light, and the landscape."
        />
      </Reveal>

      {/* Editorial highlight band */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {highlights.map((h, i) => (
          <Reveal key={h.label} delay={i * 0.08}>
            <figure className="group glass glass-reflect glass-hover relative overflow-hidden rounded-3xl">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={h.image}
                  alt={h.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-lg font-semibold">{h.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{h.caption}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="mt-20">
        <Reveal>
          <SectionHeading eyebrow="The full collection" title="Every space, every season" />
        </Reveal>
        <GalleryGrid items={items} />
      </div>

      {/* CTA */}
      <section className="mt-24">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">See it for yourself</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              No photograph does the valley justice. Come stand on the terrace and watch the light move across the
              massif.
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
    </div>
  )
}
