"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Sparkles, X, Send, Mountain, RotateCw, BedDouble, CalendarCheck, UtensilsCrossed, Compass, Info, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { whatsappLink } from "@/lib/whatsapp"

type Msg = { role: "user" | "assistant"; content: string; at: number }

// Premium quick actions — each sends a useful, real prompt to the concierge backend.
const QUICK_ACTIONS: { label: string; prompt: string; icon: typeof BedDouble }[] = [
  { label: "Find a Room", prompt: "Which room would you recommend for my stay?", icon: BedDouble },
  { label: "Check Availability", prompt: "What rooms are available for my dates?", icon: CalendarCheck },
  { label: "Book My Stay", prompt: "How do I book a room?", icon: Sparkles },
  { label: "Restaurant & Menu", prompt: "Tell me about the restaurant and menu.", icon: UtensilsCrossed },
  { label: "Things to Do", prompt: "What can I do around Tukuche?", icon: Compass },
  { label: "Hotel Information", prompt: "Tell me about check-in, check-out and hotel policies.", icon: Info },
  { label: "Contact Hotel", prompt: "How can I contact the hotel?", icon: Phone },
]

const GREETING: Msg = {
  role: "assistant",
  content:
    "Namaste, and welcome to Hotel Tukuche Peak. I'm your personal concierge. I can help with rooms, dining, experiences, availability, and booking. How may I assist you today?",
  at: 0,
}

const WHATSAPP_HREF = whatsappLink("Hello Hotel Tukuche Peak, I'd like some help planning my stay.")

function timeLabel(at: number) {
  if (!at) return ""
  return new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function Concierge() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [errored, setErrored] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastUserRef = useRef<string>("")
  const reduce = useReducedMotion()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  // Allow the navbar (and anywhere else) to open the concierge.
  useEffect(() => {
    const openHandler = () => setOpen(true)
    window.addEventListener("concierge:open", openHandler)
    return () => window.removeEventListener("concierge:open", openHandler)
  }, [])

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open])

  async function send(text: string) {
    const content = text.trim()
    if (!content || loading) return
    setErrored(false)
    lastUserRef.current = content
    const outgoing: Msg[] = [...messages, { role: "user", content, at: Date.now() }]
    setMessages(outgoing)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outgoing.filter((m) => m.at !== 0).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) {
        // Surface a clean, guest-friendly message (never raw diagnostics).
        throw new Error(res.status === 429 ? "rate" : "connect")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      setMessages((m) => [...m, { role: "assistant", content: "", at: Date.now() }])
      // Stream tokens into the last assistant message.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: "assistant", content: acc, at: copy[copy.length - 1].at }
          return copy
        })
      }
      // Empty completion (e.g. all reasoning was stripped) — treat as a soft failure.
      if (!acc.trim()) {
        setMessages((m) => m.slice(0, -1))
        setErrored(true)
      }
    } catch {
      setErrored(true)
    } finally {
      setLoading(false)
    }
  }

  function retry() {
    if (lastUserRef.current) {
      // Re-send the last user prompt without duplicating it in the transcript.
      const prompt = lastUserRef.current
      setErrored(false)
      setLoading(true)
      ;(async () => {
        try {
          const history = messages.filter((m) => m.at !== 0).map((m) => ({ role: m.role, content: m.content }))
          const res = await fetch("/api/concierge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history }),
          })
          if (!res.ok || !res.body) throw new Error("connect")
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let acc = ""
          setMessages((m) => [...m, { role: "assistant", content: "", at: Date.now() }])
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            acc += decoder.decode(value, { stream: true })
            setMessages((m) => {
              const copy = [...m]
              copy[copy.length - 1] = { role: "assistant", content: acc, at: copy[copy.length - 1].at }
              return copy
            })
          }
          if (!acc.trim()) {
            setMessages((m) => m.slice(0, -1))
            setErrored(true)
          }
        } catch {
          setErrored(true)
        } finally {
          setLoading(false)
        }
      })()
      void prompt
    }
  }

  const panelTransition = reduce
    ? { duration: 0.2 }
    : ({ type: "spring", damping: 26, stiffness: 300 } as const)

  return (
    <>
      {/* Floating launcher — desktop right lower-middle; mobile right, above the safe area (WhatsApp sits bottom-left). */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 md:bottom-auto md:right-5 md:top-[60%] md:-translate-y-1/2">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={
                reduce
                  ? { scale: 1, opacity: 1 }
                  : { scale: 1, opacity: 1, y: [0, -4, 0] }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", stiffness: 260, damping: 20 } }
              }
              onClick={() => setOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="glass-strong glass-reflect glass-interactive group flex items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-3 shadow-lg ring-1 ring-accent/20 md:pr-4"
              aria-label="Open AI Concierge"
            >
              <span className="animate-pulse-ring grid size-9 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="hidden text-sm font-medium md:inline">AI Concierge</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — subtle on desktop, dimming on mobile bottom-sheet. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] sm:bg-background/20"
              aria-hidden
            />

            {/* Outer wrapper owns positioning (no glass utilities, so `fixed` is not
                overridden by the `.glass-*` classes which force `position: relative`). */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.97 }}
              transition={panelTransition}
              className={cn(
                "fixed z-50",
                // Mobile: compact bottom sheet (~78vh), safe-area aware. Desktop: floating right panel.
                "inset-x-0 bottom-0 top-[22%] sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[620px] sm:max-h-[85vh] sm:w-[420px]",
              )}
            >
            <div
              role="dialog"
              aria-label="AI Concierge"
              aria-modal="true"
              className="glass-strong glass-reflect relative flex h-full w-full flex-col overflow-hidden rounded-t-3xl border border-border/50 shadow-2xl pb-[env(safe-area-inset-bottom)] sm:rounded-3xl sm:pb-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-background/30 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground">
                    <Mountain className="size-4" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold leading-tight">Tukuche Concierge</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Always here to help
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-full transition-colors hover:bg-foreground/10"
                  aria-label="Close concierge"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Transcript */}
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 30 }}
                    className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                        m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-foreground/5 text-foreground",
                      )}
                    >
                      {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                    </div>
                    {m.at !== 0 && m.content ? (
                      <span className="px-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {timeLabel(m.at)}
                      </span>
                    ) : null}
                  </motion.div>
                ))}

                {loading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-foreground/5 px-3.5 py-2.5 text-sm text-muted-foreground">
                      <span className="inline-flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-foreground/40" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Error + graceful WhatsApp fallback */}
                {errored && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/60 bg-background/40 p-3 text-sm"
                  >
                    <p className="text-foreground/80">
                      I&apos;m having trouble connecting right now. Please try again in a moment.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        onClick={retry}
                        disabled={loading}
                        className="glass-interactive inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                      >
                        <RotateCw className="size-3.5" /> Try again
                      </button>
                      <a
                        href={WHATSAPP_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-interactive inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-foreground/5"
                      >
                        <Phone className="size-3.5" /> Contact on WhatsApp
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick actions — shown before the conversation gets going. */}
              {messages.length <= 1 && !errored && (
                <div className="border-t border-border/40 px-3 pb-3 pt-3">
                  <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Quick actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((a) => {
                      const Icon = a.icon
                      return (
                        <button
                          key={a.label}
                          onClick={() => send(a.prompt)}
                          className="glass-interactive inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-xs text-foreground/80 hover:bg-foreground/5"
                        >
                          <Icon className="size-3.5 text-accent" />
                          {a.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send(input)
                }}
                className="flex items-center gap-2 border-t border-border/50 bg-background/30 p-3"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                  placeholder="Ask about rooms, dining, experiences…"
                  className="min-w-0 flex-1 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
                  aria-label="Message"
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileTap={{ scale: 0.9 }}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </motion.button>
              </form>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
