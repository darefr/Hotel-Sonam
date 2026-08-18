"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updatePreferences, type ActionState } from "@/lib/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Prefs = {
  bedType?: string
  floor?: string
  dietary?: string
  smoking?: boolean
  newsletter?: boolean
  notes?: string
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Saving…" : "Save preferences"}
    </Button>
  )
}

export function PreferencesForm({ prefs }: { prefs: Prefs }) {
  const [state, action] = useActionState<ActionState, FormData>(updatePreferences, {})

  useEffect(() => {
    if (state.success) toast.success(state.success)
    else if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="glass glass-reflect rounded-3xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bedType">Preferred bed</Label>
          <select
            id="bedType"
            name="bedType"
            defaultValue={prefs.bedType ?? ""}
            className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="">No preference</option>
            <option value="king">King</option>
            <option value="queen">Queen</option>
            <option value="twin">Twin</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="floor">Floor preference</Label>
          <select
            id="floor"
            name="floor"
            defaultValue={prefs.floor ?? ""}
            className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="">No preference</option>
            <option value="low">Lower floor</option>
            <option value="high">Higher floor</option>
            <option value="view">Best mountain view</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="dietary">Dietary requirements</Label>
          <Input id="dietary" name="dietary" defaultValue={prefs.dietary ?? ""} placeholder="Vegetarian, gluten-free, allergies…" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes for the hotel</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={prefs.notes ?? ""} placeholder="Anything that makes your stay perfect…" maxLength={500} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="smoking" defaultChecked={prefs.smoking} className="size-4 accent-[var(--color-primary)]" />
          Prefer a smoking-permitted room
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="newsletter" defaultChecked={prefs.newsletter} className="size-4 accent-[var(--color-primary)]" />
          Send me offers and seasonal updates
        </label>
      </div>

      <div className="mt-6">
        <SaveButton />
      </div>
    </form>
  )
}
