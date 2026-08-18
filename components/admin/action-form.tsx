"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Result = { ok: boolean; error?: string; message?: string }
type Action = (formData: FormData) => Promise<Result>

/** A <form> whose submit calls a Result-returning server action and toasts the outcome. */
export function ActionForm({
  action,
  children,
  className,
  onDone,
  confirm,
}: {
  action: Action
  children: React.ReactNode
  className?: string
  onDone?: (r: Result) => void
  confirm?: string
}) {
  const [pending, start] = useTransition()

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        if (confirm && !window.confirm(confirm)) return
        const fd = new FormData(e.currentTarget)
        const form = e.currentTarget
        start(async () => {
          const r = await action(fd)
          if (r.ok) {
            toast.success(r.message || "Saved")
            onDone?.(r)
          } else {
            toast.error(r.error || "Something went wrong")
          }
          if (r.ok) form.reset?.()
        })
      }}
      data-pending={pending ? "" : undefined}
    >
      {children}
    </form>
  )
}

/** A single-button form (e.g. status change) with hidden inputs supplied via `fields`. */
export function ActionButton({
  action,
  fields,
  children,
  variant = "outline",
  size = "sm",
  className,
  confirm,
  onDone,
}: {
  action: Action
  fields: Record<string, string>
  children: React.ReactNode
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
  confirm?: string
  onDone?: (r: Result) => void
}) {
  const [pending, start] = useTransition()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return
        const fd = new FormData()
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
        start(async () => {
          const r = await action(fd)
          if (r.ok) {
            toast.success(r.message || "Done")
            onDone?.(r)
          } else {
            toast.error(r.error || "Something went wrong")
          }
        })
      }}
    >
      {children}
    </Button>
  )
}
