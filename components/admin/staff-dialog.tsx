"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, UserPlus } from "lucide-react"
import { saveStaff } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"

type Staff = { id: string; name: string; email: string; role: string }

const ROLES = [
  { value: "FRONT_DESK", label: "Front Desk" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "MARKETING", label: "Marketing" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
]

export function StaffDialog({ staff, canAssignSuper }: { staff?: Staff; canAssignSuper: boolean }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const editing = !!staff
  const roles = canAssignSuper ? ROLES : ROLES.filter((r) => r.value !== "SUPER_ADMIN")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Edit staff" />}>
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" className="gap-2" />}>
          <UserPlus className="size-4" /> Add staff
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${staff!.name}` : "Add staff member"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            start(async () => {
              const r = await saveStaff(fd)
              if (r.ok) { toast.success(r.message || "Saved"); setOpen(false) }
              else toast.error(r.error || "Could not save")
            })
          }}
          className="space-y-4"
        >
          {editing ? <input type="hidden" name="id" value={staff!.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={staff?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={staff?.email} required disabled={editing} />
            {editing ? <p className="text-xs text-muted-foreground">Email cannot be changed.</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              defaultValue={staff?.role ?? "FRONT_DESK"}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{editing ? "New password (optional)" : "Temporary password"}</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" required={!editing} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
