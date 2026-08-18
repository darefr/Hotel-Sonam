import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { VerifyForm } from "@/components/auth/verify-form"

export const metadata: Metadata = { title: "Verify your email" }
export const dynamic = "force-dynamic"

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams
  if (!email) redirect("/signup")
  return <VerifyForm email={email} />
}
