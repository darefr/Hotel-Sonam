"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { loginAction, type AuthState } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Submit() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  )
}

export function LoginForm({ next, justReset }: { next?: string; justReset?: boolean }) {
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {})

  useEffect(() => {
    if (justReset) toast.success("Password updated. Please sign in.")
  }, [justReset])

  useEffect(() => {
    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <div className="glass glass-reflect rounded-3xl p-7 sm:p-8">
      <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage your bookings and stay.</p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Submit />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Hotel Tukuche Peak?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
