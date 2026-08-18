import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getCustomerById } from "@/lib/admin"
import { money, formatDate } from "@/lib/format"
import { updateCustomerNotes, adjustLoyaltyPoints } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ActionForm } from "@/components/admin/action-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getCustomerById(id)
  if (!data) notFound()
  const { user, bookings } = data

  const lifetime = bookings
    .filter((b: any) => ["confirmed", "checked_in", "checked_out"].includes(b.status))
    .reduce((s: number, b: any) => s + Number(b.total), 0)

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All customers
      </Link>

      <PageHeader title={user.name} subtitle={user.email}>
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground">
          {user.loyalty_tier} · {user.loyalty_points} pts
        </span>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Booking history ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {bookings.map((b: any) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link href={`/admin/bookings/${b.reference}`} className="font-mono text-xs text-primary hover:underline">
                        {b.reference}
                      </Link>
                      <p className="text-sm text-foreground">{b.room_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{money(Number(b.total))}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Internal notes</h2>
            <ActionForm action={updateCustomerNotes} className="space-y-3">
              <input type="hidden" name="id" value={user.id} />
              <Textarea name="notes" defaultValue={user.notes ?? ""} rows={4} placeholder="Preferences, allergies, VIP notes…" />
              <Button type="submit" size="sm">Save notes</Button>
            </ActionForm>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Overview</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Phone" value={user.phone || "—"} />
              <Row label="WhatsApp" value={user.whatsapp || "—"} />
              <Row label="Member since" value={formatDate(user.created_at)} />
              <Row label="Lifetime value" value={money(lifetime)} />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Adjust loyalty points</h2>
            <ActionForm action={adjustLoyaltyPoints} className="space-y-3">
              <input type="hidden" name="id" value={user.id} />
              <div className="space-y-2">
                <Label htmlFor="points">Points (use negative to deduct)</Label>
                <Input id="points" name="points" type="number" placeholder="e.g. 500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" name="reason" placeholder="Goodwill gesture" />
              </div>
              <Button type="submit" size="sm">Apply adjustment</Button>
            </ActionForm>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}
