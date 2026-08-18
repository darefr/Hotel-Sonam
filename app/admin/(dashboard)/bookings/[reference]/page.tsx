import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getBookingByRef } from "@/lib/admin"
import { money, formatDate, formatDateTime } from "@/lib/format"
import { updateBookingStatus, updatePaymentStatus } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { ActionButton } from "@/components/admin/action-form"

const NEXT_STATUS: Record<string, { label: string; value: string }[]> = {
  pending: [
    { label: "Confirm", value: "confirmed" },
    { label: "Cancel", value: "cancelled" },
  ],
  confirmed: [
    { label: "Check in", value: "checked_in" },
    { label: "Cancel", value: "cancelled" },
  ],
  checked_in: [{ label: "Check out", value: "checked_out" }],
  checked_out: [],
  cancelled: [{ label: "Reinstate (pending)", value: "pending" }],
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>
}) {
  const { reference } = await params
  const b = await getBookingByRef(reference)
  if (!b) notFound()

  const transitions = NEXT_STATUS[b.status] ?? []

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/bookings" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All bookings
      </Link>

      <PageHeader title={b.reference} subtitle={`Created ${formatDateTime(b.created_at)}`}>
        <StatusBadge status={b.status} />
        <StatusBadge status={b.payment_status} />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Reservation</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Room" value={b.room_name || "Unassigned"} />
            <Field label="Guests" value={String(b.guests)} />
            <Field label="Check-in" value={formatDate(b.check_in)} />
            <Field label="Check-out" value={formatDate(b.check_out)} />
            <Field label="Nights" value={String(b.nights)} />
            <Field label="Source" value={b.source} />
          </dl>

          {b.special_requests ? (
            <div className="mt-4 rounded-lg bg-muted p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Special requests</p>
              <p className="mt-1 text-sm text-foreground">{b.special_requests}</p>
            </div>
          ) : null}

          <div className="mt-5 border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Charges</h3>
            <dl className="space-y-1.5 text-sm">
              <Row label={`Room rate × ${b.nights}`} value={money(Number(b.subtotal))} />
              <Row label="Tax (13%)" value={money(Number(b.tax))} />
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{money(Number(b.total))}</dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Guest</h2>
            <p className="font-medium text-foreground">{b.guest_name}</p>
            <p className="text-sm text-muted-foreground">{b.guest_email}</p>
            {b.guest_phone ? <p className="text-sm text-muted-foreground">{b.guest_phone}</p> : null}
            {b.loyalty_tier ? (
              <p className="mt-2 text-xs text-muted-foreground">Loyalty tier: <span className="font-medium text-foreground">{b.loyalty_tier}</span></p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Update status</h2>
            <div className="flex flex-wrap gap-2">
              {transitions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No further transitions.</p>
              ) : (
                transitions.map((t) => (
                  <ActionButton
                    key={t.value}
                    action={updateBookingStatus}
                    fields={{ id: b.id, status: t.value }}
                    variant={t.value === "cancelled" ? "destructive" : "default"}
                    confirm={t.value === "cancelled" ? "Cancel this booking and notify the guest?" : undefined}
                  >
                    {t.label}
                  </ActionButton>
                ))
              )}
            </div>

            <h2 className="mb-3 mt-5 text-sm font-semibold text-foreground">Payment</h2>
            <div className="flex flex-wrap gap-2">
              {(["unpaid", "paid", "refunded"] as const).map((p) => (
                <ActionButton
                  key={p}
                  action={updatePaymentStatus}
                  fields={{ id: b.id, payment_status: p }}
                  variant={b.payment_status === p ? "default" : "outline"}
                >
                  {p}
                </ActionButton>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 capitalize text-foreground">{value}</dd>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}
