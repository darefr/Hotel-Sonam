"use client"

import { useState, useTransition } from "react"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { toggleWishlist } from "@/lib/actions/account"
import { cn } from "@/lib/utils"

export function WishlistToggle({
  roomId,
  initialSaved,
  variant = "icon",
}: {
  roomId: string
  initialSaved: boolean
  variant?: "icon" | "button"
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  function onToggle() {
    startTransition(async () => {
      const res = await toggleWishlist(roomId)
      if (res.error) {
        toast.error(res.error)
        return
      }
      setSaved(res.saved)
      toast.success(res.saved ? "Saved to wishlist" : "Removed from wishlist")
    })
  }

  if (variant === "button") {
    return (
      <button
        onClick={onToggle}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
          saved ? "bg-primary/15 text-primary" : "glass text-foreground hover:bg-foreground/5",
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Heart className={cn("size-4", saved && "fill-current")} />}
        {saved ? "Saved" : "Save"}
      </button>
    )
  }

  return (
    <button
      onClick={onToggle}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className="grid size-9 place-items-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", saved ? "fill-primary text-primary" : "text-foreground/70")} />
      )}
    </button>
  )
}
