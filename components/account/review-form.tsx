"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { submitReview, type ActionState } from "@/lib/actions/account"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Stay = { room_id: string; room_name: string }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Submitting…" : "Submit review"}
    </Button>
  )
}

export function ReviewForm({ stays }: { stays: Stay[] }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [state, action] = useActionState<ActionState, FormData>(submitReview, {})

  useEffect(() => {
    if (state.success) {
      toast.success(state.success)
      setRating(0)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form action={action} className="glass glass-reflect rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold">Write a review</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tell future guests about your experience.</p>

      <div className="mt-5 space-y-4">
        {stays.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="roomId">Which room?</Label>
            <select
              id="roomId"
              name="roomId"
              className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="">General / overall stay</option>
              {stays.map((s) => (
                <option key={s.room_id} value={s.room_id}>{s.room_name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Rating</Label>
          <input type="hidden" name="rating" value={rating} />
          <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-checked={rating === n}
                role="radio"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-0.5"
              >
                <Star className={cn("size-7 transition-colors", (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-foreground/25")} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title (optional)</Label>
          <Input id="title" name="title" placeholder="A magical Himalayan escape" maxLength={120} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="body">Your review</Label>
          <Textarea id="body" name="body" rows={5} required placeholder="Share the details of your stay…" />
        </div>

        <SubmitButton />
      </div>
    </form>
  )
}
