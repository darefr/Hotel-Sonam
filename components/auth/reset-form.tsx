"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"
import { resetPasswordAction, resendCodeAction, type AuthState } from "@/lib/actions/auth"
import { passwordStrength } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Updating…" : "Reset password"}
    </Button>
  )
}

const STRENGTH_COLORS = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-amber-400", "bg-primary", "bg-primary"]

export function ResetForm({ email }: { email: string }) {
  const [state, action] = useActionState<AuthState, FormData>(resetPasswordAction, {})
  const [pw, setPw] = useState("")
  const strength = passwordStrength(pw)

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  async function resend() {
    const res = await resendCodeAction(email, "reset")
    if (res.info) toast.success(res.info)
    else if (res.error) toast.error(res.error)
  }

  return (
    <div className="glass glass-reflect rounded-3xl p-7 sm:p-8">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ShieldCheck className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter the code sent to <span className="font-medium text-foreground">{email}</span> and choose a new password.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Reset code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            placeholder="000000"
            className="text-center text-xl tracking-[0.4em]"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          {pw && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all ${STRENGTH_COLORS[strength.score]}`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{strength.label}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" placeholder="Re-enter password" />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Submit />
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <button onClick={resend} className="font-medium text-primary hover:underline">
          Resend code
        </button>
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
