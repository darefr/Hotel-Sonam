"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

type Item = { id: string; url: string; caption?: string | null; category?: string | null }

export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null)
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[]
  const [filter, setFilter] = useState<string>("All")

  const visible = filter === "All" ? items : items.filter((i) => i.category === filter)

  return (
    <>
      {categories.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={
                "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                (filter === c ? "bg-primary text-primary-foreground" : "glass hover:bg-foreground/5")
              }
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((item, i) => (
          <motion.button
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
            onClick={() => setActive(item)}
            className="group glass block w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={item.url || "/placeholder.svg"}
              alt={item.caption ?? "Hotel Tukuche Peak"}
              width={600}
              height={800}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
          >
            <button
              className="glass-strong absolute right-4 top-4 grid size-10 place-items-center rounded-full"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong max-h-[85vh] max-w-4xl overflow-hidden rounded-3xl"
            >
              <Image
                src={active.url || "/placeholder.svg"}
                alt={active.caption ?? "Hotel Tukuche Peak"}
                width={1200}
                height={800}
                className="max-h-[75vh] w-auto object-contain"
              />
              {active.caption && <p className="px-6 py-4 text-center text-sm text-muted-foreground">{active.caption}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
