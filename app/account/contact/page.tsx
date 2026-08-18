import { Phone, Mail, MessageCircle, MapPin } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { whatsappLink } from "@/lib/whatsapp"
import { ContactForm } from "@/components/site/contact-form"

export const metadata = { title: "Contact hotel" }

const HOTEL_PHONE = process.env.NEXT_PUBLIC_HOTEL_PHONE || "+977 1 4000000"
const HOTEL_EMAIL = process.env.NEXT_PUBLIC_HOTEL_EMAIL || "stay@tukuchepeak.com"

export default async function AccountContactPage() {
  const user = await getCurrentUser()
  const waHref = whatsappLink(
    `Hello Hotel Tukuche Peak, this is ${user?.name ?? "a guest"} — I have a question about my stay.`,
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Contact the hotel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Our concierge team is here to help, around the clock.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="glass glass-reflect flex items-center gap-4 rounded-3xl p-5 transition-colors hover:bg-foreground/[0.03]">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#25D366]/15 text-[#25D366]">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <p className="font-display font-semibold">WhatsApp</p>
            <p className="text-sm text-muted-foreground">Fastest response</p>
          </div>
        </a>
        <a href={`tel:${HOTEL_PHONE.replace(/\s/g, "")}`} className="glass glass-reflect flex items-center gap-4 rounded-3xl p-5 transition-colors hover:bg-foreground/[0.03]">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Phone className="size-5" />
          </div>
          <div>
            <p className="font-display font-semibold">Call us</p>
            <p className="text-sm text-muted-foreground">{HOTEL_PHONE}</p>
          </div>
        </a>
        <a href={`mailto:${HOTEL_EMAIL}`} className="glass glass-reflect flex items-center gap-4 rounded-3xl p-5 transition-colors hover:bg-foreground/[0.03]">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Mail className="size-5" />
          </div>
          <div>
            <p className="font-display font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">{HOTEL_EMAIL}</p>
          </div>
        </a>
        <div className="glass glass-reflect flex items-center gap-4 rounded-3xl p-5">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="font-display font-semibold">Find us</p>
            <p className="text-sm text-muted-foreground">Tukuche, Mustang, Nepal</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Send a message</h2>
        <ContactForm />
      </div>
    </div>
  )
}
