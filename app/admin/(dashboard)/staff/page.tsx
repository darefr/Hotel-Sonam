import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getStaff } from "@/lib/admin"
import { formatDate } from "@/lib/format"
import { removeStaff } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StaffDialog } from "@/components/admin/staff-dialog"
import { ActionButton } from "@/components/admin/action-form"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  FRONT_DESK: "Front Desk",
  HOUSEKEEPING: "Housekeeping",
  RESTAURANT: "Restaurant",
  MARKETING: "Marketing",
}

export default async function StaffPage() {
  const session = await getSession()
  if (!session || !(session.role === "SUPER_ADMIN" || session.role === "ADMIN")) redirect("/admin")

  const staff = await getStaff()
  const isSuper = session.role === "SUPER_ADMIN"

  return (
    <div>
      <PageHeader title="Staff & Roles" subtitle={`${staff.length} team member(s)`}>
        <StaffDialog canAssignSuper={isSuper} />
      </PageHeader>

      <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        Roles determine which console sections each member can access. Only Super Admins can create Super Admins or revoke staff access.
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Since</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-foreground">
                  {s.name}
                  {s.id === session.id ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {ROLE_LABELS[s.role] ?? s.role}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <StaffDialog staff={s} canAssignSuper={isSuper} />
                    {isSuper && s.id !== session.id ? (
                      <ActionButton
                        action={removeStaff}
                        fields={{ id: s.id }}
                        variant="ghost"
                        size="sm"
                        confirm={`Revoke staff access for ${s.name}? They will become a regular guest.`}
                      >
                        Revoke
                      </ActionButton>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
