import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ResetForm } from "@/components/auth/reset-form"

export const metadata: Metadata = { title: "Reset password" }
export const dynamic = "force-dynamic"

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams
  if (!email) redirect("/forgot-password")
  return <ResetForm email={email} />
}
