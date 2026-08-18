import { Star } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getUserReviews, getReviewableStays } from "@/lib/account"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ReviewForm } from "@/components/account/review-form"

export const metadata = { title: "My reviews" }

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
}

export default async function ReviewsPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const [reviews, stays] = await Promise.all([
    getUserReviews(user.id as string),
    getReviewableStays(user.id as string),
  ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">My reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">Rate your stays and help other travelers.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ReviewForm stays={stays.map((s) => ({ room_id: s.room_id, room_name: s.room_name }))} />

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Your reviews</h2>
          {reviews.length === 0 ? (
            <div className="glass glass-reflect rounded-3xl p-8 text-center text-sm text-muted-foreground">
              You haven&apos;t written any reviews yet.
            </div>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="glass glass-reflect rounded-3xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={cn("size-4", n <= Number(r.rating) ? "fill-amber-400 text-amber-400" : "text-foreground/20")} />
                    ))}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[r.status] ?? "bg-foreground/10"}`}>
                    {r.status}
                  </span>
                </div>
                {r.title && <h3 className="mt-2 font-display text-base font-semibold">{r.title}</h3>}
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {r.room_name ? `${r.room_name} · ` : ""}{formatDate(r.created_at)}
                </p>
                {r.reply && (
                  <div className="mt-3 rounded-2xl bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">Response from Hotel Tukuche Peak</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.reply}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
