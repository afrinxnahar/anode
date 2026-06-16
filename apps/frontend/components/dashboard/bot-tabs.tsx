"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useAnodeStore, MODE_META } from "@/lib/anode-store"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

const TABS = [
  { key: "", label: "Overview" },
  { key: "/train", label: "Train" },
  { key: "/build", label: "Build" },
  { key: "/test", label: "Test" },
  { key: "/embed", label: "Embed" },
]

export function BotTabs() {
  const pathname = usePathname()
  const params = useParams<{ id: string }>()
  const { getBot } = useAnodeStore()
  const bot = getBot(params.id)
  const base = `/dashboard/bot/${params.id}`

  return (
    <div className="border-b border-border/60 bg-card">
      <div className="flex items-center justify-between px-6 pt-5 md:px-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Overview
        </Link>
        {bot && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2" style={{ background: bot.appearance.accent }} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {MODE_META[bot.mode].label} mode
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1 overflow-x-auto px-4 md:px-8">
        {TABS.map((tab) => {
          const href = `${base}${tab.key}`
          const active = pathname === href
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "border-b-2 px-3 py-3 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
