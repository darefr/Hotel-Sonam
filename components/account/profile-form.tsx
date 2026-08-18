"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateProfile, type ActionState } from "@/lib/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Saving…" : "Save changes"}
    </Button>
  )
}

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string; whatsapp: string }
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, {})

  useEffect(() => {
    if (state.success) toast.success(state.success)
    else if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="glass glass-reflect rounded-3xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required defaultValue={user.name} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled readOnly />
          <p className="text-xs text-muted-foreground">Contact the hotel to change your email address.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={user.phone} placeholder="+977 …" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={user.whatsapp} placeholder="+977 …" />
        </div>
      </div>
      <div className="mt-6">
        <SaveButton />
      </div>
    </form>
  )
}
