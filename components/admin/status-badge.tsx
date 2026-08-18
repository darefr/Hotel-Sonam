import { cn } from "@/lib/utils"

const STYLES: Record<string, string> = {
  // bookings
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  checked_in: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  checked_out: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
  // payment
  unpaid: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  refunded: "bg-muted text-muted-foreground",
  // reviews
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  hidden: "bg-muted text-muted-foreground",
  // rooms
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  blocked: "bg-destructive/15 text-destructive",
  // waitlist
  open: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  contacted: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  converted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium capitalize",
        STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {String(status).replace("_", " ")}
    </span>
  )
}
