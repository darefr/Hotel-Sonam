"use client"

import { useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { changePassword, type ActionState } from "@/lib/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Updating…" : "Change password"}
    </Button>
  )
}

export function SecurityForm() {
  const [state, action] = useActionState<ActionState, FormData>(changePassword, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="glass glass-reflect rounded-3xl p-6 sm:p-8">
      <div className="grid max-w-md gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" name="current" type="password" required autoComplete="current-password" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="next">New password</Label>
          <Input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div className="mt-2">
          <SaveButton />
        </div>
      </div>
    </form>
  )
}
