import { Trash2, Star } from "lucide-react"
import { getAdminRooms } from "@/lib/admin"
import { money } from "@/lib/format"
import { deleteRoom } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { RoomDialog } from "@/components/admin/room-dialog"
import { ActionButton } from "@/components/admin/action-form"

export default async function RoomsPage() {
  const rooms = await getAdminRooms()

  return (
    <div>
      <PageHeader title="Rooms" subtitle={`${rooms.length} room type(s)`}>
        <RoomDialog />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rooms yet. Add your first room type.</p>
        ) : (
          rooms.map((room) => {
            const img = Array.isArray(room.images) ? room.images[0] : undefined
            return (
              <article key={room.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[16/10] bg-muted">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img || "/placeholder.svg"} alt={room.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                  )}
                  {room.featured ? (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-medium text-accent-foreground">
                      <Star className="size-3" /> Featured
                    </span>
                  ) : null}
                  <span className="absolute right-2 top-2"><StatusBadge status={room.status} /></span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg text-foreground">{room.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {money(Number(room.price))}/night · sleeps {room.capacity}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <RoomDialog room={{ ...room, price: Number(room.price) }} />
                      <ActionButton
                        action={deleteRoom}
                        fields={{ id: room.id }}
                        variant="ghost"
                        size="icon"
                        confirm={`Delete ${room.name}? This cannot be undone.`}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </ActionButton>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{room.total_units} unit(s)</span>
                    <span className={room.occupied_now >= room.total_units ? "text-destructive" : "text-emerald-600"}>
                      {room.occupied_now}/{room.total_units} occupied now
                    </span>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
