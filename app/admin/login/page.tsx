import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession, isStaff } from "@/lib/auth"
import { AdminLoginForm } from "@/components/admin/admin-login-form"

export const metadata: Metadata = {
  title: "Staff Sign In — Hotel Tukuche Peak PMS",
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session && isStaff(session.role)) redirect("/admin")

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4 py-16 text-primary-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-accent">Hotel Tukuche Peak</p>
          <h1 className="mt-3 font-serif text-3xl">Property Management</h1>
          <p className="mt-2 text-sm text-primary-foreground/70">Authorised staff access only.</p>
        </div>
        <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-2xl">
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-primary-foreground/60">
          This area is monitored. Unauthorised access is prohibited.
        </p>
      </div>
    </main>
  )
}
