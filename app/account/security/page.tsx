import { Shield, CheckCircle2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/format"
import { SecurityForm } from "@/components/account/security-form"

export const metadata = { title: "Security" }

export default async function SecurityPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Account & security</h1>
        <p className="mt-1 text-sm text-muted-foreground">Keep your account safe and up to date.</p>
      </header>

      <div className="glass glass-reflect rounded-3xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Shield className="size-5 text-primary" /> Account status
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl bg-foreground/[0.04] px-4 py-3">
            <dt className="text-muted-foreground">Email verified</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              {user.email_verified ? (
                <><CheckCircle2 className="size-4 text-primary" /> Verified</>
              ) : (
                <span className="text-amber-500">Not verified</span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-foreground/[0.04] px-4 py-3">
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="font-medium">{formatDate(user.created_at)}</dd>
          </div>
        </dl>
      </div>

      <SecurityForm />
    </div>
  )
}
