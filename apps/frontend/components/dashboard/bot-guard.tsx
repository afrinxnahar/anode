"use client"

import type { ReactNode } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAnodeStore } from "@/lib/anode-store"

/** Renders children only when the bot exists; shows loading / not-found otherwise. */
export function BotGuard({ children }: { children: (botId: string) => ReactNode }) {
  const params = useParams<{ id: string }>()
  const { getBot, ready } = useAnodeStore()
  const bot = getBot(params.id)

  if (!ready) {
    return (
      <div className="flex flex-col gap-4 px-6 py-10 md:px-10">
        <div className="h-8 w-48 animate-pulse bg-muted" />
        <div className="h-40 w-full animate-pulse bg-muted" />
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-foreground">Assistant not found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This assistant doesn&apos;t exist or was removed. Head back to the overview to pick another.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90"
        >
          Back to overview
        </Link>
      </div>
    )
  }

  return <>{children(params.id)}</>
}
