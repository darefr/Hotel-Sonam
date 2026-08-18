import { getCurrentUser } from "@/lib/auth"
import { ProfileForm } from "@/components/account/profile-form"

export const metadata = { title: "Profile" }

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal and contact details.</p>
      </header>
      <ProfileForm
        user={{
          name: (user.name as string) ?? "",
          email: (user.email as string) ?? "",
          phone: (user.phone as string) ?? "",
          whatsapp: (user.whatsapp as string) ?? "",
        }}
      />
    </div>
  )
}
