import type { Metadata } from "next"
import { ForgotForm } from "@/components/auth/forgot-form"

export const metadata: Metadata = { title: "Forgot password" }
export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
  return <ForgotForm />
}
