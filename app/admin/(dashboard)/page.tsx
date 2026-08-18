import Link from "next/link"
import { DollarSign, CalendarCheck, BedDouble, Users, Star, LogIn, LogOut, Clock } from "lucide-react"
import { getDashboardStats, getRevenueTrend, getOccupancyForecast, getRevenueByRoom, getArrivalsDepartures } from "@/lib/admin"
import { money } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import { StatCard } from "@/components/admin/stat-card"
import { RevenueTrendChart, OccupancyChart, RevenueByRoomChart } from "@/components/admin/dashboard-charts"
import { StatusBadge } from "@/components/admin/status-badge"

export default async function AdminDashboard() {
  const [stats, trend, occupancy, byRoom, lists] = await Promise.all([
    getDashboardStats(),
    getRevenueTrend(6),
    getOccupancyForecast(14),
    getRevenueByRoom(),
    getArrivalsDepartures(),
  ])

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview of the property" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue (all time)" value={money(stats.totalRevenue)} hint={`${money(stats.monthRevenue)} this month`} icon={DollarSign} accent />
        <StatCard label="Occupancy tonight" value={`${stats.occupancy}%`} hint={`${stats.inHouse} rooms in-house`} icon={BedDouble} />
        <StatCard label="Bookings" value={stats.totalBookings} hint={`${stats.pendingBookings} pending`} icon={CalendarCheck} />
        <StatCard label="Guests" value={stats.totalGuests} hint={`${stats.totalUnits} room units`} icon={Users} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Arrivals today" value={stats.arrivalsToday} icon={LogIn} />
        <StatCard label="Departures today" value={stats.departuresToday} icon={LogOut} />
        <StatCard label="Avg. rating" value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"} hint={`${stats.pendingReviews} to moderate`} icon={Star} />
        <StatCard label="Pending review queue" value={stats.pendingReviews} icon={Clock} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <RevenueTrendChart data={trend} />
        <OccupancyChart data={occupancy} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RevenueByRoomChart data={byRoom} />
        </div>
        <div className="lg:col-span-2">
          <TodayPanel arrivals={lists.arrivals} departures={lists.departures} />
        </div>
      </div>
    </div>
  )
}

function TodayPanel({ arrivals, departures }: { arrivals: any[]; departures: any[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Today at a glance</h3>
        <Link href="/admin/frontdesk" className="text-xs font-medium text-primary hover:underline">
          Front desk →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <LogIn className="size-3.5" /> Arrivals ({arrivals.length})
          </p>
          <ul className="space-y-2">
            {arrivals.length === 0 ? (
              <li className="text-sm text-muted-foreground">No arrivals scheduled.</li>
            ) : (
              arrivals.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{b.guest_name}</span>
                    <span className="text-xs text-muted-foreground">{b.room_name || "Unassigned"} · {b.guests} guest(s)</span>
                  </span>
                  <StatusBadge status={b.status} />
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <LogOut className="size-3.5" /> Departures ({departures.length})
          </p>
          <ul className="space-y-2">
            {departures.length === 0 ? (
              <li className="text-sm text-muted-foreground">No departures scheduled.</li>
            ) : (
              departures.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{b.guest_name}</span>
                    <span className="text-xs text-muted-foreground">{b.room_name || "Unassigned"}</span>
                  </span>
                  <StatusBadge status={b.status} />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
