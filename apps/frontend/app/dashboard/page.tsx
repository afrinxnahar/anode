"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Plus, ArrowUpRight, Database, Zap, Bot } from "lucide-react"
import { useAnodeStore, MODE_META } from "@/lib/anode-store"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardOverview() {
  const { bots, ready } = useAnodeStore()

  const stats = useMemo(() => {
    const live = bots.filter((b) => b.status === "live").length
    const sources = bots.reduce((sum, b) => sum + b.sources.length, 0)
    const trained = bots.reduce((sum, b) => sum + b.sources.filter((s) => s.status === "ready").length, 0)
    return { live, sources, trained, total: bots.length }
  }, [bots])

  return (
    <div className="flex flex-col">
      <DashboardHeader
        eyebrow="Workspace"
        title="Your assistants"
        description="Train, build, and ship AI assistants that live inside any website. Pick one to continue, or spin up a new one."
        actions={
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 bg-accent px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New assistant
          </Link>
        }
      />

      <div className="px-6 py-6 md:px-10 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-px border border-border/60 bg-border/60 md:grid-cols-4">
          <StatCell icon={<Bot className="h-4 w-4" />} label="Assistants" value={stats.total} />
          <StatCell icon={<Zap className="h-4 w-4" />} label="Live" value={stats.live} />
          <StatCell icon={<Database className="h-4 w-4" />} label="Sources" value={stats.sources} />
          <StatCell icon={<Database className="h-4 w-4" />} label="Trained" value={stats.trained} />
        </div>

        {/* Bot grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {ready &&
            bots.map((bot) => {
              const ready = bot.sources.filter((s) => s.status === "ready").length
              return (
                <Link
                  key={bot.id}
                  href={`/dashboard/bot/${bot.id}`}
                  className="group flex flex-col border border-border/60 bg-card transition-colors hover:border-accent"
                >
                  <div className="flex items-start justify-between border-b border-border/60 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5" style={{ background: bot.appearance.accent }} aria-hidden="true" />
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm text-foreground">{bot.name}</span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                          {MODE_META[bot.mode].index} / {MODE_META[bot.mode].label}
                        </span>
                      </div>
                    </div>
                    <span
                      className={
                        bot.status === "live"
                          ? "border border-accent/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent"
                          : "border border-border/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground"
                      }
                    >
                      {bot.status}
                    </span>
                  </div>

                  <p className="px-5 py-4 text-xs leading-relaxed text-muted-foreground line-clamp-3">{bot.persona}</p>

                  <div className="mt-auto flex items-center justify-between border-t border-border/60 px-5 py-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {ready}/{bot.sources.length} sources trained
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent" />
                  </div>
                </Link>
              )
            })}

          {/* New card */}
          {ready && (
            <Link
              href="/dashboard/new"
              className="flex min-h-[180px] flex-col items-center justify-center gap-3 border border-dashed border-border/60 bg-card/40 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <Plus className="h-6 w-6" />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em]">New assistant</span>
            </Link>
          )}

          {!ready &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[180px] animate-pulse border border-border/60 bg-card" />
            ))}
        </div>
      </div>
    </div>
  )
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2 bg-card px-5 py-5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-[family-name:var(--font-bebas)] text-3xl leading-none text-foreground">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    </div>
  )
}
