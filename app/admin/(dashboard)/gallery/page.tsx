import { Trash2 } from "lucide-react"
import { getAdminGallery } from "@/lib/admin"
import { saveGalleryImage, deleteGalleryImage } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { ActionButton, ActionForm } from "@/components/admin/action-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function GalleryPage() {
  const images = await getAdminGallery()

  return (
    <div>
      <PageHeader title="Gallery" subtitle={`${images.length} image(s)`} />

      <ActionForm action={saveGalleryImage} className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <Input name="url" placeholder="Image URL (/images/...)" required />
        <Input name="caption" placeholder="Caption" />
        <Input name="category" placeholder="Category" />
        <Button type="submit">Add image</Button>
      </ActionForm>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        ) : (
          images.map((img) => (
            <figure key={img.id} className="group relative overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url || "/placeholder.svg"} alt={img.caption || "Gallery image"} className="h-full w-full object-cover" />
              </div>
              <figcaption className="flex items-center justify-between gap-2 p-2">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-foreground">{img.caption || "Untitled"}</span>
                  {img.category ? <span className="text-[0.65rem] text-muted-foreground">{img.category}</span> : null}
                </span>
                <ActionButton action={deleteGalleryImage} fields={{ id: img.id }} variant="ghost" size="icon" confirm="Delete this image?">
                  <Trash2 className="size-4 text-destructive" />
                </ActionButton>
              </figcaption>
            </figure>
          ))
        )}
      </div>
    </div>
  )
}
