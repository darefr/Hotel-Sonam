import type { Metadata } from "next"
import Link from "next/link"
import { Star, Mountain, ConciergeBell, UtensilsCrossed, Flame } from "lucide-react"
import { getApprovedReviews, getReviewStats } from "@/lib/data"
import { getSession } from "@/lib/auth"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Guest Reviews",
  description: "Read what guests say about their stay at Hotel Tukuche Peak.",
}

export const dynamic = "force-dynamic"

export default async function ReviewsPage() {
  const [reviews, stats, session] = await Promise.all([getApprovedReviews(48), getReviewStats(), getSession()])

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-32">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Guests"
            title="What our guests say"
            description={`An average of ${stats.avg.toFixed(1)} out of 5 across ${stats.count} verified stays.`}
          />
          <Button asChild className="rounded-xl">
            <Link href={session ? "/account/reviews" : "/login?next=/account/reviews"}>Write a review</Link>
          </Button>
        </div>
      </Reveal>

      {/* Rating summary */}
      <Reveal>
        <div className="mt-10 grid gap-6 rounded-3xl glass-strong glass-reflect p-8 sm:grid-cols-3 sm:p-10">
          <div className="flex flex-col items-center justify-center border-b border-border/50 pb-6 sm:border-b-0 sm:border-r sm:pb-0">
            <div className="font-display text-6xl font-semibold text-primary">{stats.avg.toFixed(1)}</div>
            <div className="mt-2 flex gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={s < Math.round(stats.avg) ? "size-5 fill-current" : "size-5 opacity-30"} />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{stats.count} verified reviews</p>
          </div>
          <div className="flex flex-col justify-center gap-2 sm:col-span-2">
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Our guests consistently praise the panoramic views, the warmth of our team, and the quiet comfort of heated
              suites after a day on the trail. Every review below is from a guest who has stayed with us.
            </p>
            <p className="text-sm font-medium text-primary">Thank you for making Tukuche Peak what it is.</p>
          </div>
        </div>
      </Reveal>

      {/* What guests praise most */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {praise.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <div className="glass glass-reflect glass-hover flex h-full items-center gap-4 rounded-2xl p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                {p.icon}
              </span>
              <div>
                <h3 className="font-display font-semibold leading-tight">{p.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.detail}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r: any, i: number) => (
          <Reveal key={r.id} delay={(i % 6) * 0.05}>
            <figure className="glass glass-reflect flex h-full flex-col rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={s < r.rating ? "size-4 fill-current" : "size-4 opacity-30"} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
              </div>
              {r.title && <h3 className="mt-3 font-display font-semibold">{r.title}</h3>}
              <blockquote className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
                “{r.body}”
              </blockquote>
              <figcaption className="mt-4 flex items-center justify-between text-sm">
                <span className="font-medium">{r.guest_name}</span>
                {r.room_name && <span className="text-xs text-muted-foreground">{r.room_name}</span>}
              </figcaption>
              {r.reply && (
                <div className="mt-4 rounded-2xl bg-primary/5 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Response from the hotel</p>
                  <p className="mt-1 text-muted-foreground">{r.reply}</p>
                </div>
              )}
            </figure>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-24">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
              Come write your own story
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Join the guests who&apos;ve woken to sunrise over Dhaulagiri and carried the stillness home.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href={session ? "/account/reviews" : "/login?next=/account/reviews"}>Write a review</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/book">Book your stay</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

const praise = [
  { icon: <Mountain className="size-5" />, title: "The views", detail: "Panoramas from every room" },
  { icon: <ConciergeBell className="size-5" />, title: "The service", detail: "Warm, first-name hospitality" },
  { icon: <UtensilsCrossed className="size-5" />, title: "The food", detail: "Authentic Thakali cuisine" },
  { icon: <Flame className="size-5" />, title: "The comfort", detail: "Heated suites, deep rest" },
]
