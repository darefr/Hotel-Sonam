import { getCurrentUser } from "@/lib/auth"
import { PreferencesForm } from "@/components/account/preferences-form"

export const metadata = { title: "Preferences" }

export default async function PreferencesPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const prefs = (user.preferences as Record<string, any>) ?? {}

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Stay preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">We&apos;ll use these to tailor every stay to you.</p>
      </header>
      <PreferencesForm prefs={prefs} />
    </div>
  )
}
