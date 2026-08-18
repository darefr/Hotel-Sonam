import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mountain } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col lg:flex-row">
      {/* Cinematic panel */}
      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="/images/hero-himalaya.png"
          alt="Hotel Tukuche Peak beneath the Himalayan peaks"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link href="/" className="flex w-fit items-center gap-2 font-display text-lg font-semibold text-white drop-shadow">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Mountain className="size-5" aria-hidden />
            </span>
            Hotel Tukuche Peak
          </Link>
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Tukuche · Mustang · Nepal</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-white drop-shadow">
              Your Himalayan escape, always within reach
            </h2>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="absolute inset-0 -z-10 lg:hidden">
          <Image src="/images/gallery/valley.png" alt="" fill className="object-cover opacity-20" />
        </div>
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex w-fit items-center gap-2 font-display text-lg font-semibold lg:hidden">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Mountain className="size-4" aria-hidden />
            </span>
            Hotel Tukuche Peak
          </Link>
          {children}
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  )
}
