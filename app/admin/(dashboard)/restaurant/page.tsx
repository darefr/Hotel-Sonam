import { Trash2, Star } from "lucide-react"
import { getAdminMenu } from "@/lib/admin"
import { money } from "@/lib/format"
import { saveMenuCategory, deleteMenuItem } from "@/lib/actions/admin"
import { PageHeader } from "@/components/admin/page-header"
import { MenuItemDialog } from "@/components/admin/menu-item-dialog"
import { ActionButton, ActionForm } from "@/components/admin/action-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function RestaurantPage() {
  const menu = await getAdminMenu()
  const categories = menu.map((c: any) => ({ id: c.id, name: c.name }))

  return (
    <div>
      <PageHeader title="Restaurant" subtitle="Manage menu categories and dishes">
        {categories.length > 0 ? <MenuItemDialog categories={categories} defaultCategoryId={categories[0].id} /> : null}
      </PageHeader>

      <ActionForm action={saveMenuCategory} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex-1 min-w-48">
          <Input name="name" placeholder="New category name" required />
        </div>
        <Input name="sort" type="number" placeholder="Sort" defaultValue={0} className="w-24" />
        <Button type="submit" variant="secondary">Add category</Button>
      </ActionForm>

      {menu.length === 0 ? (
        <p className="text-sm text-muted-foreground">No menu categories yet. Add one above.</p>
      ) : (
        <div className="space-y-6">
          {menu.map((cat: any) => (
            <section key={cat.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg text-foreground">{cat.name}</h2>
                <MenuItemDialog categories={categories} defaultCategoryId={cat.id} />
              </div>
              {cat.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dishes in this category yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {cat.items.map((it: any) => (
                    <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium text-foreground">
                          {it.name}
                          {it.featured ? <Star className="size-3.5 fill-accent text-accent" /> : null}
                          {!it.available ? <span className="text-xs text-destructive">(unavailable)</span> : null}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{it.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">{money(Number(it.price))}</span>
                        <MenuItemDialog categories={categories} item={{ ...it, price: Number(it.price) }} />
                        <ActionButton action={deleteMenuItem} fields={{ id: it.id }} variant="ghost" size="icon" confirm={`Delete "${it.name}"?`}>
                          <Trash2 className="size-4 text-destructive" />
                        </ActionButton>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
