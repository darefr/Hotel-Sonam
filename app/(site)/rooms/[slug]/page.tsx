import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Users, Maximize, BedDouble, Check, ArrowLeft } from "lucide-react"
import { getRoomBySlug, getRooms } from "@/lib/data"
import { getSession } from "@/lib/auth"
import { getWishlistRoomIds } from "@/lib/account"
import { Reveal } from "@/components/site/reveal"
import { WishlistToggle } from "@/components/account/wishlist-toggle"
import { Button } from "@/components/ui/button"
import { money } from "@/lib/format"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const room = await getRoomBySlug(slug)
  if (!room) return { title: "Room not found" }
  return {
    title: room.name,
    description: room.description,
    openGraph: { images: room.images?.[0] ? [room.images[0]] : [] },
  }
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const room = await getRoomBySlug(slug)
  if (!room) notFound()

  const others = (await getRooms()).filter((r) => r.slug !== slug).slice(0, 3)
  const images = room.images?.length ? room.images : ["/images/room-deluxe.png"]

  const session = await getSession()
  const savedRoomIds = session ? await getWishlistRoomIds(session.id) : []
  const isSaved = savedRoomIds.includes(room.id)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    image: images,
    occupancy: { "@type": "QuantitativeValue", maxValue: room.capacity },
    offers: { "@type": "Offer", price: Number(room.price), priceCurrency: "USD" },
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/rooms">
          <ArrowLeft className="size-4" /> All rooms
        </Link>
      </Button>

      <div className="grid gap-3 md:grid-cols-2">
        <Reveal className="md:row-span-2">
          <div className="glass overflow-hidden rounded-3xl">
            <Image
              src={images[0] || "/placeholder.svg"}
              alt={room.name}
              width={900}
              height={700}
              priority
              className="aspect-[4/3] w-full object-cover md:aspect-[3/4]"
            />
          </div>
        </Reveal>
        {images.slice(1, 3).map((img, i) => (
          <Reveal key={i} delay={0.1 + i * 0.08}>
            <div className="glass overflow-hidden rounded-3xl">
              <Image
                src={img || "/placeholder.svg"}
                alt={`${room.name} view ${i + 2}`}
                width={700}
                height={500}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="font-display text-4xl font-semibold">{room.name}</h1>
          <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" /> Sleeps {room.capacity}
            </span>
            {room.beds && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-primary" /> {room.beds}
              </span>
            )}
            {room.size_sqm && (
              <span className="flex items-center gap-1.5">
                <Maximize className="size-4 text-primary" /> {room.size_sqm} m²
              </span>
            )}
          </div>
          <p className="mt-6 text-pretty leading-relaxed text-foreground/90">
            {room.long_description || room.description}
          </p>

          {room.amenities?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold">Amenities</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {room.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-foreground/85">
                    <Check className="size-4 shrink-0 text-primary" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="glass-strong glass-reflect rounded-3xl p-6">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-display text-3xl font-semibold">
              {money(room.price)}
              <span className="text-base font-normal text-muted-foreground"> / night</span>
            </p>
            <Button asChild className="mt-5 w-full rounded-xl" size="lg">
              <Link href={`/book?room=${room.slug}`}>Check availability</Link>
            </Button>
            {session ? (
              <div className="mt-3 flex justify-center">
                <WishlistToggle roomId={room.id} initialSaved={isSaved} variant="button" />
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
                <Link href={`/login?next=/rooms/${room.slug}`}>Sign in to save</Link>
              </Button>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">Free cancellation up to 72h before check-in</p>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-semibold">You may also like</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {others.map((r) => (
              <div key={r.id} className="glass glass-reflect overflow-hidden rounded-3xl">
                <Link href={`/rooms/${r.slug}`}>
                  <Image
                    src={r.images?.[0] || "/images/room-deluxe.png"}
                    alt={r.name}
                    width={500}
                    height={375}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-display font-semibold">{r.name}</h3>
                    <p className="text-sm text-muted-foreground">{money(r.price)} / night</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
