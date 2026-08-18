"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import { saveOffer } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"

type Offer = {
  id: string; title: string; description: string; category: string; discount_pct: number
  code?: string; image?: string; start_date?: string; end_date?: string; active: boolean
}

export function OfferDialog({ offer }: { offer?: Offer }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const editing = !!offer

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Edit offer" />}>
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" className="gap-2" />}>
          <Plus className="size-4" /> Add offer
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit offer" : "New offer"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            start(async () => {
              const r = await saveOffer(fd)
              if (r.ok) { toast.success(r.message || "Saved"); setOpen(false) }
              else toast.error(r.error || "Could not save")
            })
          }}
          className="space-y-4"
        >
          {editing ? <input type="hidden" name="id" value={offer!.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={offer?.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={offer?.description} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" defaultValue={offer?.category ?? "seasonal"}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="seasonal">Seasonal</option>
                <option value="early-bird">Early bird</option>
                <option value="long-stay">Long stay</option>
                <option value="package">Package</option>
                <option value="last-minute">Last minute</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_pct">Discount %</Label>
              <Input id="discount_pct" name="discount_pct" type="number" min={0} max={100} defaultValue={offer?.discount_pct ?? 0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="code">Promo code</Label>
              <Input id="code" name="code" defaultValue={offer?.code ?? ""} placeholder="WINTER25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" name="image" defaultValue={offer?.image ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={offer?.start_date?.slice(0, 10) ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={offer?.end_date?.slice(0, 10) ?? ""} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch name="active" defaultChecked={offer ? offer.active : true} value="true" />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save offer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
