import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AccountSidebar } from "@/components/account/account-sidebar"
import { SiteNav } from "@/components/site/site-nav"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: { default: "Guest Portal", template: "%s · Guest Portal" },
  robots: { index: false },
}

export const dynamic = "force-dynamic"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/account")

  const displayUser = {
    name: user.name as string,
    email: user.email as string,
    loyaltyTier: (user.loyalty_tier as string) ?? "Bronze",
    loyaltyPoints: Number(user.loyalty_points ?? 0),
  }

  return (
    <div className="min-h-dvh">
      <SiteNav user={{ name: displayUser.name, role: "GUEST" }} />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AccountSidebar user={displayUser} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  )
}
