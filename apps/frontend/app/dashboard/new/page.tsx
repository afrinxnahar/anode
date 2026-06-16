"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAnodeStore, MODE_META, type BotMode } from "@/lib/anode-store"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

const MODES: BotMode[] = ["public", "private", "dev"]

export default function NewAssistantPage() {
  const router = useRouter()
  const { createBot } = useAnodeStore()
  const [name, setName] = useState("")
  const [mode, setMode] = useState<BotMode>("public")

  const submit = () => {
    const bot = createBot({ name: name.trim() || "Untitled assistant", mode })
    router.push(`/dashboard/bot/${bot.id}/train`)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        eyebrow="Create"
        title="New assistant"
        description="Name your assistant and choose how it will be deployed. You can change everything later."
      />

      <div className="px-6 py-6 md:px-10 md:py-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to overview
        </Link>

        <div className="max-w-2xl">
          {/* Name */}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Assistant name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Acme Support Bot"
              autoFocus
              className="mt-2 w-full border border-border/60 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
            />
          </label>

          {/* Mode */}
          <div className="mt-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Deployment mode
            </span>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {MODES.map((m) => {
                const meta = MODE_META[m]
                const active = mode === m
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex flex-col gap-3 border p-4 text-left transition-colors",
                      active ? "border-accent bg-accent/5" : "border-border/60 bg-card hover:border-border",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {meta.index}
                      </span>
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center border",
                          active ? "border-accent bg-accent text-accent-foreground" : "border-border/60",
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                    </div>
                    <span className="font-[family-name:var(--font-bebas)] text-2xl leading-none tracking-wide text-foreground">
                      {meta.label}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">{meta.blurb}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={submit}
            className="mt-10 flex items-center gap-2 bg-accent px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Create & start training
          </button>
        </div>
      </div>
    </div>
  )
}
