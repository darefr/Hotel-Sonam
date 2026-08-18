import { Check, Mail } from "lucide-react"
import { getContactMessages } from "@/lib/admin"
import { formatDateTime } from "@/lib/format"
import { markContactHandled } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { ActionButton } from "@/components/admin/action-form"

export default async function MessagesPage() {
  const messages = await getContactMessages()
  const open = messages.filter((m) => !m.handled).length

  return (
    <div>
      <PageHeader title="Messages" subtitle={`${open} open · ${messages.length} total`} />

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border p-5 ${m.handled ? "border-border bg-card/60" : "border-primary/30 bg-card"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>
                    {m.phone ? ` · ${m.phone}` : ""} · {formatDateTime(m.created_at)}
                  </p>
                </div>
                <ActionButton
                  action={markContactHandled}
                  fields={{ id: m.id }}
                  size="sm"
                  variant={m.handled ? "ghost" : "default"}
                >
                  {m.handled ? "Reopen" : <><Check className="mr-1 size-4" /> Mark handled</>}
                </ActionButton>
              </div>
              {m.subject ? <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground"><Mail className="size-3.5" /> {m.subject}</p> : null}
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{m.message}</p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
