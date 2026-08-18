"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { signupAction, type AuthState } from "@/lib/actions/auth"
import { passwordStrength } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Creating account…" : "Create account"}
    </Button>
  )
}

const STRENGTH_COLORS = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-amber-400", "bg-primary", "bg-primary"]

export function SignupForm() {
  const [state, action] = useActionState<AuthState, FormData>(signupAction, {})
  const [pw, setPw] = useState("")
  const strength = passwordStrength(pw)

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <div className="glass glass-reflect rounded-3xl p-7 sm:p-8">
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Join us to book faster and earn loyalty rewards.</p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required autoComplete="name" placeholder="Your full name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" autoComplete="tel" placeholder="+977 …" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" placeholder="Re-enter password" />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Submit />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
