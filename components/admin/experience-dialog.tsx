"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"
import { saveExperience } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"

type Experience = {
  id: string; title: string; description: string; image?: string
  duration?: string; difficulty?: string; price: number; sort: number
}

export function ExperienceDialog({ experience }: { experience?: Experience }) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const editing = !!experience

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {editing ? (
        <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Edit experience" />}>
          <Pencil className="size-4" />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="sm" className="gap-2" />}>
          <Plus className="size-4" /> Add experience
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit experience" : "New experience"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            start(async () => {
              const r = await saveExperience(fd)
              if (r.ok) { toast.success(r.message || "Saved"); setOpen(false) }
              else toast.error(r.error || "Could not save")
            })
          }}
          className="space-y-4"
        >
          {editing ? <input type="hidden" name="id" value={experience!.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={experience?.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={experience?.description} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" name="image" defaultValue={experience?.image ?? ""} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" defaultValue={experience?.duration ?? ""} placeholder="Half day" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Input id="difficulty" name="difficulty" defaultValue={experience?.difficulty ?? ""} placeholder="Moderate" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={experience?.price ?? 0} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort order</Label>
            <Input id="sort" name="sort" type="number" defaultValue={experience?.sort ?? 0} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save experience"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
