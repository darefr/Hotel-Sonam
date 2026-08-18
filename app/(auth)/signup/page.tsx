import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Create account" }
export const dynamic = "force-dynamic"

export default async function SignupPage() {
  const session = await getSession()
  if (session) redirect(session.role === "GUEST" ? "/account" : "/admin")
  return <SignupForm />
}
