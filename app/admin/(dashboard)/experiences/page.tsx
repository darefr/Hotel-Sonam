import { Trash2, Clock, Gauge } from "lucide-react"
import { getAdminExperiences } from "@/lib/admin"
import { money } from "@/lib/format"
import { deleteExperience } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { ExperienceDialog } from "@/components/admin/experience-dialog"
import { ActionButton } from "@/components/admin/action-form"

export default async function ExperiencesPage() {
  const experiences = await getAdminExperiences()

  return (
    <div>
      <PageHeader title="Experiences" subtitle={`${experiences.length} curated experience(s)`}>
        <ExperienceDialog />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {experiences.length === 0 ? (
          <p className="text-sm text-muted-foreground">No experiences yet.</p>
        ) : (
          experiences.map((x) => (
            <article key={x.id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-[16/10] bg-muted">
                {x.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={x.image || "/placeholder.svg"} alt={x.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-lg text-foreground">{x.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{x.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {x.duration ? <span className="flex items-center gap-1"><Clock className="size-3" /> {x.duration}</span> : null}
                  {x.difficulty ? <span className="flex items-center gap-1"><Gauge className="size-3" /> {x.difficulty}</span> : null}
                  {Number(x.price) > 0 ? <span className="font-medium text-foreground">{money(Number(x.price))}</span> : null}
                </div>
                <div className="mt-auto flex items-center justify-end gap-1 pt-3">
                  <ExperienceDialog experience={{ ...x, price: Number(x.price) }} />
                  <ActionButton action={deleteExperience} fields={{ id: x.id }} variant="ghost" size="icon" confirm={`Delete "${x.title}"?`}>
                    <Trash2 className="size-4 text-destructive" />
                  </ActionButton>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
