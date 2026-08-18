import type { ReactNode } from "react"
import { SiteNav } from "@/components/site/site-nav"
import { SiteFooter } from "@/components/site/site-footer"
import { WhatsAppFab } from "@/components/site/whatsapp-fab"
import { Concierge } from "@/components/site/concierge"
import { Toaster } from "@/components/ui/sonner"
import { getSession } from "@/lib/auth"

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  const user = session ? { name: session.name, role: session.role } : null

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFab />
      <Concierge />
      <Toaster position="top-center" />
    </div>
  )
}
