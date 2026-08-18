import { Sparkles, TrendingUp, Gift } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getLoyaltyHistory } from "@/lib/account"
import { formatDate, tierProgress } from "@/lib/format"

export const metadata = { title: "Loyalty" }

const tiers = [
  { name: "Bronze", at: 0, perk: "Welcome drink on arrival" },
  { name: "Silver", at: 500, perk: "Late checkout & 5% off dining" },
  { name: "Gold", at: 2000, perk: "Room upgrades & 10% off stays" },
  { name: "Platinum", at: 5000, perk: "Suite upgrades & private guide day" },
]

export default async function LoyaltyPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const points = Number(user.loyalty_points ?? 0)
  const progress = tierProgress(points)
  const history = await getLoyaltyHistory(user.id as string)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Loyalty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Earn 1 point for every $1 spent. Redeem for upgrades and perks.</p>
      </header>

      <section className="glass-strong glass-reflect rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" /> {progress.current} member
            </span>
            <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{points.toLocaleString()}<span className="ml-2 text-lg text-muted-foreground">points</span></p>
          </div>
          {progress.next && (
            <p className="text-sm text-muted-foreground">
              {(progress.nextAt! - points).toLocaleString()} pts to <span className="font-semibold text-foreground">{progress.next}</span>
            </p>
          )}
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.pct}%` }} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => {
          const active = progress.current === t.name
          const reached = points >= t.at
          return (
            <div key={t.name} className={`glass glass-reflect rounded-3xl p-5 ${active ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                {reached && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">Reached</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.at.toLocaleString()}+ points</p>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <Gift className="mt-0.5 size-4 shrink-0 text-primary" /> {t.perk}
              </p>
            </div>
          )
        })}
      </section>

      <section className="glass glass-reflect rounded-3xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <TrendingUp className="size-5 text-primary" /> Points activity
        </h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No points activity yet. Book a stay to start earning.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{h.reason}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(h.created_at)}</p>
                </div>
                <span className={`font-display text-base font-semibold tabular-nums ${Number(h.points) >= 0 ? "text-primary" : "text-destructive"}`}>
                  {Number(h.points) >= 0 ? "+" : ""}{Number(h.points).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
