"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import { saveRoom } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"

type Room = {
  id: string; name: string; slug: string; description: string; long_description?: string
  price: number; capacity: number; total_units: number; size_sqm?: number; beds?: string
  amenities: string[]; images: string[]; featured: boolean; status: string; sort: number
}

export function RoomDialog({ room }: { room?: Room }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const editing = !!room

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Edit room" />}>
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" className="gap-2" />}>
          <Plus className="size-4" /> Add room
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${room!.name}` : "Add a new room"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            start(async () => {
              const r = await saveRoom(fd)
              if (r.ok) { toast.success(r.message || "Saved"); setOpen(false) }
              else toast.error(r.error || "Could not save")
            })
          }}
          className="space-y-4"
        >
          {editing ? <input type="hidden" name="id" value={room!.id} /> : null}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={room?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={room?.slug} placeholder="deluxe-suite" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea id="description" name="description" defaultValue={room?.description} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="long_description">Long description</Label>
            <Textarea id="long_description" name="long_description" defaultValue={room?.long_description} rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price / night</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={room?.price} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min={1} defaultValue={room?.capacity ?? 2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_units">Units</Label>
              <Input id="total_units" name="total_units" type="number" min={1} defaultValue={room?.total_units ?? 1} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="size_sqm">Size (m²)</Label>
              <Input id="size_sqm" name="size_sqm" type="number" defaultValue={room?.size_sqm ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beds">Beds</Label>
              <Input id="beds" name="beds" defaultValue={room?.beds ?? ""} placeholder="1 King" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort</Label>
              <Input id="sort" name="sort" type="number" defaultValue={room?.sort ?? 0} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma or newline separated)</Label>
            <Textarea id="amenities" name="amenities" defaultValue={room?.amenities?.join(", ")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">Image URLs (comma or newline separated)</Label>
            <Textarea id="images" name="images" defaultValue={room?.images?.join("\n")} rows={2} placeholder="/images/room.png" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={room?.status ?? "active"}
                className="h-9 w-40 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch name="featured" defaultChecked={room?.featured} value="true" />
              Featured
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save room"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
