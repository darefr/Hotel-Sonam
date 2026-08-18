"use client"

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"

const money = (n: number) => "$" + Number(n).toLocaleString("en-US")

const PIE_COLORS = [
  "oklch(0.42 0.062 165)",
  "oklch(0.72 0.09 75)",
  "oklch(0.55 0.05 200)",
  "oklch(0.5 0.08 140)",
  "oklch(0.6 0.06 40)",
  "oklch(0.45 0.04 280)",
]

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      <div className="h-64 w-full">{children}</div>
    </div>
  )
}

export function RevenueTrendChart({ data }: { data: { label: string; revenue: number; bookings: number }[] }) {
  return (
    <Panel title="Revenue trend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.42 0.062 165)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="oklch(0.42 0.062 165)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 130)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.5 0.015 150)" />
          <YAxis tickFormatter={(v) => "$" + (v >= 1000 ? v / 1000 + "k" : v)} tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.5 0.015 150)" width={48} />
          <Tooltip
            formatter={((v: any, n: any) => (n === "revenue" ? money(Number(v)) : v)) as any}
            contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.88 0.01 130)", fontSize: 12 }}
          />
          <Area type="monotone" dataKey="revenue" stroke="oklch(0.42 0.062 165)" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function OccupancyChart({ data }: { data: { label: string; occupancy: number }[] }) {
  return (
    <Panel title="Occupancy forecast (14 days)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 130)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval={1} stroke="oklch(0.5 0.015 150)" />
          <YAxis tickFormatter={(v) => v + "%"} domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="oklch(0.5 0.015 150)" width={40} />
          <Tooltip
            formatter={((v: any) => v + "% occupied") as any}
            contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.88 0.01 130)", fontSize: 12 }}
          />
          <Bar dataKey="occupancy" fill="oklch(0.72 0.09 75)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function RevenueByRoomChart({ data }: { data: { name: string; revenue: number }[] }) {
  const filtered = data.filter((d) => d.revenue > 0)
  if (filtered.length === 0) {
    return (
      <Panel title="Revenue by room type">
        <div className="grid h-full place-items-center text-sm text-muted-foreground">No revenue recorded yet</div>
      </Panel>
    )
  }
  return (
    <Panel title="Revenue by room type">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={filtered} dataKey="revenue" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {filtered.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={((v: any, n: any) => [money(Number(v)), n]) as any}
            contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.88 0.01 130)", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {filtered.map((d, i) => (
          <li key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            {d.name}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
