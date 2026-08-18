"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"
import { createManualBooking } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"

type Room = { id: string; name: string; price: number }

export function WalkInDialog({ rooms }: { rooms: Room[] }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" className="gap-2" />}
      >
        <UserPlus className="size-4" /> New walk-in
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New walk-in / phone booking</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            start(async () => {
              const r = await createManualBooking(fd)
              if (r.ok) {
                toast.success(r.message || "Booking created")
                setOpen(false)
              } else {
                toast.error(r.error || "Could not create booking")
              }
            })
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="guest_name">Guest name</Label>
            <Input id="guest_name" name="guest_name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="guest_email">Email</Label>
              <Input id="guest_email" name="guest_email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest_phone">Phone</Label>
              <Input id="guest_phone" name="guest_phone" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room_id">Room</Label>
            <select
              id="room_id"
              name="room_id"
              required
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — ${Number(r.price).toLocaleString()}/night
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="check_in">Check-in</Label>
              <Input id="check_in" name="check_in" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out">Check-out</Label>
              <Input id="check_out" name="check_out" type="date" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Input id="guests" name="guests" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <select
                id="source"
                name="source"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="walk_in">Walk-in</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
