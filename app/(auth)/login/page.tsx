import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Sign in" }
export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>
}) {
  const session = await getSession()
  if (session) redirect(session.role === "GUEST" ? "/account" : "/admin")
  const { next, reset } = await searchParams
  return <LoginForm next={next} justReset={reset === "1"} />
}
