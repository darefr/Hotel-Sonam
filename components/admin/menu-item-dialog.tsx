"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import { saveMenuItem } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"

type Category = { id: string; name: string }
type Item = {
  id: string; category_id: string; name: string; description: string; price: number
  image?: string; dietary: string[]; featured: boolean; available: boolean; sort: number
}

export function MenuItemDialog({
  categories,
  defaultCategoryId,
  item,
}: {
  categories: Category[]
  defaultCategoryId?: string
  item?: Item
}) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const editing = !!item

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Edit item" />}>
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" variant="outline" className="gap-2" />}>
          <Plus className="size-4" /> Add item
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit menu item" : "New menu item"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            start(async () => {
              const r = await saveMenuItem(fd)
              if (r.ok) { toast.success(r.message || "Saved"); setOpen(false) }
              else toast.error(r.error || "Could not save")
            })
          }}
          className="space-y-4"
        >
          {editing ? <input type="hidden" name="id" value={item!.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={item?.category_id ?? defaultCategoryId}
              required
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={item?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={item?.price} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={item?.description} rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" name="image" defaultValue={item?.image ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dietary">Dietary tags (comma separated)</Label>
            <Input id="dietary" name="dietary" defaultValue={item?.dietary?.join(", ")} placeholder="Vegetarian, Gluten-free" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch name="featured" defaultChecked={item?.featured} value="true" /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch name="available" defaultChecked={item ? item.available : true} value="true" /> Available
            </label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
