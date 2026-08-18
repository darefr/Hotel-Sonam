"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type Row = Record<string, string | number | null>

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(",")]
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","))
  return lines.join("\n")
}

export function ExportCsvButton({ rows, filename }: { rows: Row[]; filename: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-2"
      disabled={rows.length === 0}
      onClick={() => {
        const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }}
    >
      <Download className="size-4" /> Export CSV
    </Button>
  )
}
