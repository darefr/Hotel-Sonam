"use client"

import { MessageCircle } from "lucide-react"
import { whatsappLink, bookingWhatsappMessage } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"

type Booking = Parameters<typeof bookingWhatsappMessage>[0]

export function WhatsAppButton({ booking }: { booking: Booking }) {
  const href = whatsappLink(bookingWhatsappMessage(booking))
  return (
    <Button asChild className="w-full rounded-xl bg-[#25D366] text-white hover:bg-[#1ebe5b]">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-4" /> Message hotel on WhatsApp
      </a>
    </Button>
  )
}
