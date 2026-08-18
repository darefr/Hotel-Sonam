import { NextResponse } from "next/server"
import { getRooms, getOffers, getFaqs, getMenu, getExperiences } from "@/lib/data"
import { getSession } from "@/lib/auth"
import { getUserBookings, splitBookings } from "@/lib/account"
import { rateLimit } from "@/lib/rate-limit"
import { money, formatDate } from "@/lib/format"

export const runtime = "nodejs"
export const maxDuration = 60

// Resolve the OpenAI-compatible provider config tolerantly, so the route works with
// whichever naming convention is configured in the Vercel environment.
const API_KEY =
  process.env.NVIDIA_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.AI_API_KEY ||
  process.env.AI_GATEWAY_API_KEY ||
  ""
const BASE_URL = (
  process.env.NVIDIA_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  process.env.OPENAI_API_BASE ||
  "https://integrate.api.nvidia.com/v1"
).replace(/\/$/, "")
// Configurable so the deployment can swap models without a code change. Default is a
// widely-available, non-reasoning NVIDIA NIM model (verify active IDs via GET /v1/models).
const MODEL =
  process.env.NVIDIA_MODEL || process.env.AI_MODEL || process.env.OPENAI_MODEL || "meta/llama-3.3-70b-instruct"

// Production guardrails for the request payload.
const MAX_MESSAGES = 24 // total turns accepted before slicing
const MAX_CONTENT_CHARS = 4000 // per-message ceiling
const UPSTREAM_TIMEOUT_MS = 45_000

// Streaming-safe filter that removes <think>…</think> reasoning blocks that
// reasoning models (Nemotron) may emit inline, even when split across chunks.
function makeThinkStripper() {
  const OPEN = "<think>"
  const CLOSE = "</think>"
  let inThink = false
  let buf = ""

  // Longest suffix of `s` that is a prefix of `tag` (so we can hold back a
  // partial tag that may complete in the next chunk).
  const heldTail = (s: string, tag: string) => {
    const max = Math.min(s.length, tag.length - 1)
    for (let k = max; k > 0; k--) {
      if (tag.startsWith(s.slice(s.length - k))) return k
    }
    return 0
  }

  const push = (chunk: string) => {
    buf += chunk
    let out = ""
    while (buf.length) {
      if (!inThink) {
        const idx = buf.indexOf(OPEN)
        if (idx !== -1) {
          out += buf.slice(0, idx)
          buf = buf.slice(idx + OPEN.length)
          inThink = true
          continue
        }
        const k = heldTail(buf, OPEN)
        out += buf.slice(0, buf.length - k)
        buf = buf.slice(buf.length - k)
        break
      } else {
        const idx = buf.indexOf(CLOSE)
        if (idx !== -1) {
          buf = buf.slice(idx + CLOSE.length)
          inThink = false
          continue
        }
        buf = buf.slice(buf.length - heldTail(buf, CLOSE))
        break
      }
    }
    return out
  }

  // Flush any trailing visible text once the stream ends.
  const flush = () => {
    if (!inThink && buf) {
      const rest = buf
      buf = ""
      return rest
    }
    buf = ""
    return ""
  }

  return { push, flush }
}

async function buildContext() {
  const [rooms, offers, faqs, menu, experiences] = await Promise.all([
    getRooms(),
    getOffers(),
    getFaqs(),
    getMenu(),
    getExperiences(),
  ])

  const roomsText = rooms
    .map(
      (r) =>
        `- ${r.name} (${money(r.price)}/night, sleeps ${r.capacity}, ${r.beds ?? ""}): ${r.description}`,
    )
    .join("\n")

  const offersText = offers
    .map((o) => `- ${o.title} (${o.discount_pct}% off${o.code ? `, code ${o.code}` : ""}): ${o.description}`)
    .join("\n")

  const faqText = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")

  const menuText = menu
    .map(
      (c: any) =>
        `${c.name}: ${(c.items as any[]).map((i) => `${i.name} (${money(i.price)})`).join(", ")}`,
    )
    .join("\n")

  const experiencesText = experiences
    .map((e: any) => `- ${e.title}${e.duration ? ` (${e.duration})` : ""}: ${e.description}`)
    .join("\n")

  return { roomsText, offersText, faqText, menuText, experiencesText }
}

export async function POST(req: Request) {
  // Server-side only route: reads NVIDIA_API_KEY from the environment; never exposed to the client.
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon"
    const rl = rateLimit(`concierge:${ip}`, 20, 60_000)
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 })
    }

    const apiKey = API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Concierge is not configured." }, { status: 503 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }

    const rawMessages = (body as { messages?: unknown })?.messages
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 })
    }

    // Validate + normalize: only user/assistant roles, string content, capped length.
    const messages = rawMessages
      .slice(-MAX_MESSAGES)
      .filter(
        (m): m is { role: string; content: string } =>
          !!m &&
          typeof (m as any).content === "string" &&
          ((m as any).role === "user" || (m as any).role === "assistant"),
      )
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }))

    if (messages.length === 0) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 })
    }

    const session = await getSession()
    const ctx = await buildContext()

    // Booking-aware context for signed-in guests (never expose other guests' data).
    let guestContext = ""
    if (session) {
      const bookings = await getUserBookings(session.id)
      const { upcoming } = splitBookings(bookings)
      const upcomingText = upcoming
        .slice(0, 3)
        .map(
          (b) =>
            `- ${b.room_name ?? "Room"} · ${formatDate(b.check_in)} → ${formatDate(b.check_out)} · ${b.guests} guest(s) · ref ${b.reference} (${b.status})`,
        )
        .join("\n")
      guestContext = `\n\nSIGNED-IN GUEST: ${session.name}.${
        upcomingText
          ? `\nTheir upcoming bookings:\n${upcomingText}\nYou may reference these to help with their stay. To manage a booking, direct them to /account/bookings.`
          : " They have no upcoming bookings yet."
      }`
    }

    const systemPrompt = `detailed thinking off

You are the AI Concierge for Hotel Tukuche Peak, a luxury boutique hotel in Tukuche village, Mustang, Nepal, set between the Dhaulagiri and Annapurna Himalayan massifs.

Speak warmly, concisely, and professionally — like a five-star hotel concierge. Use only the information below. If you don't know something, say so and suggest contacting the hotel via WhatsApp (+977 985-1019065) or email (hotelsonam@gmail.com). Never invent facts, prices, or availability. Keep replies short and helpful. Currency is USD.

CHECK-IN: 2:00 PM. CHECK-OUT: 11:00 AM.

ROOMS:
${ctx.roomsText}

RESTAURANT MENU HIGHLIGHTS:
${ctx.menuText}

CURRENT OFFERS:
${ctx.offersText}

SIGNATURE EXPERIENCES:
${ctx.experiencesText}

FAQs:
${ctx.faqText}

BOOKING: Guests can book online at /book, or you can guide them. To book, they select a room, choose check-in/check-out dates and number of guests, then confirm — instant confirmation, no prepayment, pay at the hotel, free cancellation up to 72h before check-in. When a guest wants to book, walk them through it and point them to /book (you can suggest a specific room and dates). ${
      session ? "The guest is signed in and can manage bookings at /account." : "Encourage the guest to sign in or create an account at /login to manage bookings and earn loyalty points."
    }

Around Tukuche: sunrise viewpoints of Dhaulagiri, Thakali culinary experiences, apple orchards and distilleries in Marpha, heritage village walks, and the Kali Gandaki gorge.${guestContext}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

    let upstream: Response
    try {
      upstream = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.6,
          top_p: 0.95,
          max_tokens: 1024,
          stream: true,
        }),
      })
    } catch (e) {
      clearTimeout(timeout)
      const aborted = (e as Error).name === "AbortError"
      console.error("[concierge] upstream fetch failed:", (e as Error).message)
      return NextResponse.json(
        { error: aborted ? "The concierge took too long to respond." : "Concierge is temporarily unavailable." },
        { status: aborted ? 504 : 502 },
      )
    }

    if (!upstream.ok || !upstream.body) {
      clearTimeout(timeout)
      const detail = await upstream.text().catch(() => "")
      console.error("[concierge] upstream error:", upstream.status, detail.slice(0, 200))
      return NextResponse.json({ error: "Concierge is temporarily unavailable." }, { status: 502 })
    }

    // Transform the OpenAI-style SSE stream into a plain-text token stream,
    // stripping any reasoning tokens so guests only see the final answer.
    const stripper = makeThinkStripper()
    const stream = new ReadableStream<Uint8Array>({
      async start(streamController) {
        const reader = upstream.body!.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ""
        const emit = (text: string) => {
          const visible = stripper.push(text)
          if (visible) streamController.enqueue(encoder.encode(visible))
        }
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith("data:")) continue
              const data = trimmed.slice(5).trim()
              if (data === "[DONE]") continue
              try {
                const json = JSON.parse(data)
                // Only forward visible content — never reasoning_content.
                const delta = json.choices?.[0]?.delta?.content
                if (delta) emit(delta)
              } catch {
                // ignore malformed keep-alive chunks
              }
            }
          }
          const tail = stripper.flush()
          if (tail) streamController.enqueue(encoder.encode(tail))
        } catch (e) {
          console.error("[concierge] stream error:", (e as Error).message)
        } finally {
          clearTimeout(timeout)
          streamController.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    })
  } catch (e) {
    console.error("[concierge] error:", (e as Error).message)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
