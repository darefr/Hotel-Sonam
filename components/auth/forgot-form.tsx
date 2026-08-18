"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2, KeyRound } from "lucide-react"
import { requestResetAction, type AuthState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Sending code…" : "Send reset code"}
    </Button>
  )
}

export function ForgotForm() {
  const [state, action] = useActionState<AuthState, FormData>(requestResetAction, {})

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <div className="glass glass-reflect rounded-3xl p-7 sm:p-8">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <KeyRound className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a code to reset it.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Submit />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
