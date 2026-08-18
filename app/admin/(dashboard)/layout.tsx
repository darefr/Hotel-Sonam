import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession, isStaff, permsFor } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "PMS Console — Hotel Tukuche Peak",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !isStaff(session.role)) redirect("/admin/login")

  const perms = permsFor(session.role)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar perms={perms} role={session.role} name={session.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
