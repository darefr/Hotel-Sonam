export function whatsappNumber() {
  // Public number is safe to expose; strip non-digits for wa.me.
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  return raw.replace(/[^\d]/g, "")
}

export function whatsappLink(message: string) {
  const num = whatsappNumber()
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export function bookingWhatsappMessage(b: {
  reference: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  total: number | string
  specialRequests?: string | null
}) {
  // Never include passwords, OTPs, or credentials.
  return [
    `Hello Hotel Tukuche Peak, I'd like to confirm my booking:`,
    ``,
    `Reference: ${b.reference}`,
    `Name: ${b.guestName}`,
    `Email: ${b.guestEmail}`,
    b.guestPhone ? `Phone: ${b.guestPhone}` : ``,
    `Room: ${b.roomName}`,
    `Check-in: ${b.checkIn}`,
    `Check-out: ${b.checkOut}`,
    `Guests: ${b.guests}`,
    `Total: $${b.total}`,
    b.specialRequests ? `Special requests: ${b.specialRequests}` : ``,
  ]
    .filter(Boolean)
    .join("\n")
}
