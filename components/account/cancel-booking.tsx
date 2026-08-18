"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cancelBooking } from "@/lib/actions/account"
import { Button } from "@/components/ui/button"

export function CancelBooking({ reference }: { reference: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onCancel() {
    startTransition(async () => {
      const res = await cancelBooking(reference)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.success ?? "Booking cancelled.")
        setConfirming(false)
        router.refresh()
      }
    })
  }

  if (!confirming) {
    return (
      <Button variant="outline" className="w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirming(true)}>
        <X className="size-4" /> Cancel booking
      </Button>
    )
  }

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-medium">Cancel this booking?</p>
      <p className="mt-1 text-xs text-muted-foreground">Free cancellation applies up to 72 hours before check-in.</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="destructive" className="flex-1 rounded-xl" disabled={pending} onClick={onCancel}>
          {pending && <Loader2 className="size-4 animate-spin" />} Yes, cancel
        </Button>
        <Button size="sm" variant="ghost" className="flex-1 rounded-xl" disabled={pending} onClick={() => setConfirming(false)}>
          Keep it
        </Button>
      </div>
    </div>
  )
}
