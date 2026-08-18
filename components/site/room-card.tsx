import Image from "next/image"
import Link from "next/link"
import { Users, Maximize, BedDouble } from "lucide-react"
import { money } from "@/lib/format"
import type { Room } from "@/lib/data"
import { Button } from "@/components/ui/button"

export function RoomCard({ room }: { room: Room }) {
  const img = room.images?.[0] ?? "/images/room-deluxe.png"
  return (
    <article className="group glass glass-reflect glass-hover overflow-hidden rounded-3xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={img || "/placeholder.svg"}
          alt={room.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute right-3 top-3 glass-strong rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm transition-transform duration-500 group-hover:-translate-y-0.5">
          {money(room.price)}
          <span className="text-xs font-normal text-muted-foreground"> / night</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold">{room.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{room.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" /> {room.capacity} guests
          </span>
          {room.beds && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5 text-primary" /> {room.beds}
            </span>
          )}
          {room.size_sqm && (
            <span className="flex items-center gap-1.5">
              <Maximize className="size-3.5 text-primary" /> {room.size_sqm} m²
            </span>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <Button asChild variant="outline" className="flex-1 rounded-xl">
            <Link href={`/rooms/${room.slug}`}>Details</Link>
          </Button>
          <Button asChild className="flex-1 rounded-xl shimmer">
            <Link href={`/book?room=${room.slug}`}>Book</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
