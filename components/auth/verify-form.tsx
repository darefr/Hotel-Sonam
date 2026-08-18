"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2, MailCheck } from "lucide-react"
import { verifyAction, resendCodeAction, type AuthState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Verifying…" : "Verify & continue"}
    </Button>
  )
}

export function VerifyForm({ email }: { email: string }) {
  const [state, action] = useActionState<AuthState, FormData>(verifyAction, {})
  const [pending, startTransition] = useTransition()
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function resend() {
    startTransition(async () => {
      const res = await resendCodeAction(email, "verify")
      if (res.info) toast.success(res.info)
      else if (res.error) toast.error(res.error)
      setCooldown(30)
    })
  }

  return (
    <div className="glass glass-reflect rounded-3xl p-7 sm:p-8">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <MailCheck className="size-6" />
      </div>
      <h1 className="font-display text-2xl font-semibold">Verify your email</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below to activate your account.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            placeholder="000000"
            className="text-center text-2xl tracking-[0.5em]"
          />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Submit />
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Didn&apos;t get it?{" "}
        <button
          onClick={resend}
          disabled={pending || cooldown > 0}
          className="font-medium text-primary hover:underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : pending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </div>
  )
}
