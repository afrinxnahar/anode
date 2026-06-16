"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutGrid, Plus, ArrowUpRight, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAnodeStore, MODE_META } from "@/lib/anode-store"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { bots } = useAnodeStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isOverview = pathname === "/dashboard"

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center border border-border/60 bg-card text-foreground md:hidden"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-border/60 bg-card transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4"
          onClick={() => setMobileOpen(false)}
        >
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden="true" />
          <span className="font-[family-name:var(--font-bebas)] text-2xl leading-none tracking-wide text-foreground">
            ANODE
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-2 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
              isOverview ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Overview
          </Link>

          <div className="mt-6 flex items-center justify-between px-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60">
              Assistants
            </span>
            <Link
              href="/dashboard/new"
              onClick={() => setMobileOpen(false)}
              aria-label="New assistant"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="mt-2 flex flex-col gap-0.5">
            {bots.map((bot) => {
              const active = pathname?.startsWith(`/dashboard/bot/${bot.id}`)
              return (
                <li key={bot.id}>
                  <Link
                    href={`/dashboard/bot/${bot.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-2 px-2 py-2 transition-colors",
                      active ? "bg-muted" : "hover:bg-muted/50",
                    )}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0"
                      style={{ background: bot.appearance.accent }}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-xs text-foreground">{bot.name}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {MODE_META[bot.mode].label} · {bot.status}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <Link
            href="/dashboard/new"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex items-center justify-center gap-2 border border-dashed border-border/60 px-2 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Plus className="h-3 w-3" />
            New assistant
          </Link>
        </nav>

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-between border-t border-border/60 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
        >
          View site
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </aside>

      {/* Mobile scrim */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-background/80 md:hidden"
        />
      )}
    </>
  )
}
