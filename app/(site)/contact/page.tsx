import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Mail, Phone, Clock, MessageCircle, Plane, Car } from "lucide-react"
import { getFaqs } from "@/lib/data"
import { Reveal, SectionHeading } from "@/components/site/reveal"
import { ContactForm } from "@/components/site/contact-form"
import { whatsappLink } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Hotel Tukuche Peak — reservations, enquiries, and directions to our boutique retreat in Tukuche, Mustang, Nepal.",
}

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const faqs = await getFaqs()

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-32">
      <Reveal>
        <SectionHeading
          eyebrow="Contact"
          title="We'd love to hear from you"
          description="Whether you're planning a stay, arranging a transfer, or simply curious about Mustang — our team is here to help."
        />
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* Info */}
        <Reveal className="order-2 lg:order-1">
          <div className="flex h-full flex-col gap-4">
            <div className="glass glass-reflect rounded-3xl p-6">
              <h3 className="font-display text-lg font-semibold">Reach us directly</h3>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>Hotel Tukuche Peak, Tukuche, Mustang, Nepal</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                  <a href="tel:+9779851019065" className="hover:text-primary">+977 985-1019065</a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                  <a href="mailto:hotelsonam@gmail.com" className="hover:text-primary">hotelsonam@gmail.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>Check-in 2:00 PM · Check-out 11:00 AM · Reception 24/7</span>
                </li>
              </ul>
              <Button asChild className="mt-6 w-full rounded-xl bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                <a
                  href={whatsappLink("Hello Hotel Tukuche Peak, I have an enquiry.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>

            {faqs.length > 0 && (
              <div className="glass glass-reflect flex-1 rounded-3xl p-6">
                <h3 className="font-display text-lg font-semibold">Frequently asked</h3>
                <div className="mt-4 divide-y divide-border/60">
                  {faqs.map((f: any) => (
                    <details key={f.id} className="group py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
                        {f.question}
                        <span className="text-primary transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.1} className="order-1 lg:order-2">
          <ContactForm />
        </Reveal>
      </div>

      {/* Getting here */}
      <section className="mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Directions"
            title="How to reach Tukuche"
            description="We sit in the Kali Gandaki gorge, between Jomsom and Marpha. The journey is part of the adventure — and we arrange every leg for you."
          />
        </Reveal>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid content-start gap-3">
            {journey.map((j, i) => (
              <Reveal key={j.label} delay={i * 0.08}>
                <div className="glass glass-reflect flex items-center gap-4 rounded-2xl p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    {j.icon}
                  </span>
                  <div>
                    <h3 className="font-medium">{j.label}</h3>
                    <p className="text-sm text-muted-foreground">{j.detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <div className="glass glass-reflect overflow-hidden rounded-3xl p-1.5">
              <iframe
                title="Map showing Tukuche, Mustang, Nepal"
                src="https://www.google.com/maps?q=Tukuche,+Mustang,+Nepal&z=11&output=embed"
                className="h-[360px] w-full rounded-[1.4rem] border-0 lg:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="mt-24">
        <div className="glass-strong glass-reflect rounded-3xl p-10 text-center sm:p-14">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">Ready to plan your stay?</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Check availability for your dates, or message us and we&apos;ll take care of every detail.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/book">Check availability</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <a href={whatsappLink("Hello Hotel Tukuche Peak, I'd like to plan a stay.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" /> Message on WhatsApp
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

const journey = [
  {
    icon: <Plane className="size-5" />,
    label: "Kathmandu to Pokhara",
    detail: "A 25-minute scenic flight, or a day's drive through the foothills.",
  },
  {
    icon: <Plane className="size-5" />,
    label: "Pokhara to Jomsom",
    detail: "A breathtaking mountain flight into the Mustang valley.",
  },
  {
    icon: <Car className="size-5" />,
    label: "Jomsom to Tukuche",
    detail: "A 45-minute private transfer along the gorge — arranged by us.",
  },
]
