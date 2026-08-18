import Link from "next/link"
import { Star } from "lucide-react"
import { getAdminReviews } from "@/lib/admin"
import { formatDate } from "@/lib/format"
import { moderateReview, replyToReview } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ActionButton, ActionForm } from "@/components/admin/action-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const FILTERS = ["all", "pending", "approved", "rejected", "hidden"]

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = "all" } = await searchParams
  const reviews = await getAdminReviews(status)

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} review(s)`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/reviews?status=${f}`}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              status === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews in this view.</p>
        ) : (
          reviews.map((rv) => (
            <article key={rv.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex" aria-label={`${rv.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < rv.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <StatusBadge status={rv.status} />
                  </div>
                  <p className="mt-2 font-medium text-foreground">{rv.title || "Untitled"}</p>
                  <p className="text-sm text-muted-foreground">
                    {rv.guest_name} · {rv.room_name || "General"} · {formatDate(rv.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rv.status !== "approved" ? (
                    <ActionButton action={moderateReview} fields={{ id: rv.id, status: "approved" }} size="sm">Approve</ActionButton>
                  ) : null}
                  {rv.status !== "rejected" ? (
                    <ActionButton action={moderateReview} fields={{ id: rv.id, status: "rejected" }} size="sm" variant="outline">Reject</ActionButton>
                  ) : null}
                  {rv.status !== "hidden" ? (
                    <ActionButton action={moderateReview} fields={{ id: rv.id, status: "hidden" }} size="sm" variant="ghost">Hide</ActionButton>
                  ) : null}
                </div>
              </div>

              {rv.body ? <p className="mt-3 text-sm leading-relaxed text-foreground">{rv.body}</p> : null}

              <ActionForm action={replyToReview} className="mt-4 space-y-2 border-t border-border pt-4">
                <input type="hidden" name="id" value={rv.id} />
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Management response
                </label>
                <Textarea name="reply" defaultValue={rv.reply ?? ""} rows={2} placeholder="Thank the guest, address concerns…" />
                <Button type="submit" size="sm" variant="secondary">Save reply</Button>
              </ActionForm>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
