import Link from "next/link"
import Image from "next/image"
import { Heart, Users, Maximize, ArrowRight } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getWishlist } from "@/lib/account"
import { usd } from "@/lib/format"
import { WishlistToggle } from "@/components/account/wishlist-toggle"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Wishlist" }

export default async function WishlistPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const rooms = await getWishlist(user.id as string)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">Rooms and suites you&apos;ve saved for later.</p>
      </header>

      {rooms.length === 0 ? (
        <div className="glass glass-reflect rounded-3xl p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Heart className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">Nothing saved yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Browse our rooms and tap the heart to save your favorites here.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link href="/rooms">Explore rooms</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {rooms.map((r) => (
            <div key={r.id} className="glass glass-reflect overflow-hidden rounded-3xl">
              <div className="relative h-44">
                <Image src={r.images?.[0] || "/images/room-deluxe.png"} alt={r.name} fill className="object-cover" />
                <div className="absolute right-3 top-3">
                  <WishlistToggle roomId={r.id} initialSaved />
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">{r.name}</h3>
                  <p className="font-display text-lg font-semibold">{usd(r.price)}<span className="text-xs font-normal text-muted-foreground">/night</span></p>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="size-3.5 text-primary" /> {r.capacity}</span>
                  {r.size_sqm && <span className="flex items-center gap-1"><Maximize className="size-3.5 text-primary" /> {r.size_sqm} m²</span>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" className="flex-1 rounded-xl">
                    <Link href={`/book?room=${r.slug}`}>Book now</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <Link href={`/rooms/${r.slug}`}>Details <ArrowRight className="size-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
