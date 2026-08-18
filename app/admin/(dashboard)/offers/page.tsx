import { Trash2, Tag } from "lucide-react"
import { getAdminOffers } from "@/lib/admin"
import { formatDate } from "@/lib/format"
import { deleteOffer } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { OfferDialog } from "@/components/admin/offer-dialog"
import { ActionButton } from "@/components/admin/action-form"

export default async function OffersPage() {
  const offers = await getAdminOffers()

  return (
    <div>
      <PageHeader title="Offers" subtitle={`${offers.length} promotion(s)`}>
        <OfferDialog />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No offers yet.</p>
        ) : (
          offers.map((o) => (
            <article key={o.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium capitalize text-accent-foreground">
                  <Tag className="size-3" /> {o.category}
                </span>
                <span className={`text-xs font-medium ${o.active ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {o.active ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="mt-3 font-serif text-lg text-foreground">{o.title}</h3>
              {o.discount_pct ? <p className="text-2xl font-semibold text-primary">{o.discount_pct}% off</p> : null}
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{o.description}</p>
              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {o.code ? <p>Code: <span className="font-mono text-foreground">{o.code}</span></p> : null}
                {o.start_date || o.end_date ? (
                  <p>{o.start_date ? formatDate(o.start_date) : "—"} → {o.end_date ? formatDate(o.end_date) : "—"}</p>
                ) : null}
              </div>
              <div className="mt-auto flex items-center justify-end gap-1 pt-3">
                <OfferDialog offer={{ ...o, discount_pct: Number(o.discount_pct) }} />
                <ActionButton action={deleteOffer} fields={{ id: o.id }} variant="ghost" size="icon" confirm={`Delete "${o.title}"?`}>
                  <Trash2 className="size-4 text-destructive" />
                </ActionButton>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
