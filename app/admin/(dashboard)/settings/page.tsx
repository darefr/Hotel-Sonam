import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getSetting } from "@/lib/admin"
import { saveHotelSettings } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { ActionForm } from "@/components/admin/action-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session || !(session.role === "SUPER_ADMIN" || session.role === "ADMIN")) redirect("/admin")

  const info = (await getSetting("hotel_info")) ?? {}

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" subtitle="Hotel information used across the public site and communications" />

      <ActionForm action={saveHotelSettings} className="space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Hotel name</Label>
            <Input id="name" name="name" defaultValue={info.name ?? "Hotel Tukuche Peak"} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={info.tagline ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input id="email" name="email" type="email" defaultValue={info.email ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={info.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={info.whatsapp ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={info.address ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_in_time">Check-in time</Label>
            <Input id="check_in_time" name="check_in_time" defaultValue={info.checkInTime ?? "14:00"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out_time">Check-out time</Label>
            <Input id="check_out_time" name="check_out_time" defaultValue={info.checkOutTime ?? "11:00"} />
          </div>
        </div>
        <Button type="submit">Save settings</Button>
      </ActionForm>
    </div>
  )
}
