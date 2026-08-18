import Link from "next/link"
import { getCustomers } from "@/lib/admin"
import { money, formatDate } from "@/lib/format"
import { PageHeader } from "@/components/admin/page-header"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const customers = await getCustomers(q)

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} guest profile(s)`}>
        <form action="/admin/customers">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="h-9 w-56 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </PageHeader>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Lifetime value</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead>Last stay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-primary hover:underline">
                      {c.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{c.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {c.loyalty_tier}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{c.bookings_count}</TableCell>
                  <TableCell className="text-right font-medium">{money(Number(c.lifetime_value))}</TableCell>
                  <TableCell className="text-right">{c.loyalty_points}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.last_stay ? formatDate(c.last_stay) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
