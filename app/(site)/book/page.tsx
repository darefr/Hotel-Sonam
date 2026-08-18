import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/auth"
import { getRoomBySlug } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { BookingWizard } from "@/components/site/booking-wizard"

export const metadata: Metadata = {
  title: "Book your stay",
  description: "Check availability and reserve your room at Hotel Tukuche Peak — instant confirmation, pay at the hotel.",
}

export const dynamic = "force-dynamic"

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; checkIn?: string; checkOut?: string; guests?: string }>
}) {
  const sp = await searchParams
  const [user] = await Promise.all([getCurrentUser()])

  // Resolve ?room=slug so a preselection is possible.
  let roomSlug: string | undefined
  if (sp.room) {
    const room = await getRoomBySlug(sp.room)
    roomSlug = room?.slug
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-32">
      <Reveal>
        <SectionHeading
          eyebrow="Reserve"
          title="Book your Himalayan escape"
          description="Choose your dates, pick the perfect room, and confirm in seconds. No prepayment required."
        />
      </Reveal>
      <div className="mt-10">
        <BookingWizard
          initial={{
            room: roomSlug,
            checkIn: sp.checkIn,
            checkOut: sp.checkOut,
            guests: sp.guests ? Number(sp.guests) : undefined,
          }}
          user={
            user
              ? { name: user.name as string, email: user.email as string, phone: (user.phone as string) ?? null }
              : null
          }
        />
      </div>
    </div>
  )
}
