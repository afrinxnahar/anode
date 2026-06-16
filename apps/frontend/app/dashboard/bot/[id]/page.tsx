"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Database, Settings2, Play, Code2, Trash2, Zap } from "lucide-react"
import { useAnodeStore, MODE_META } from "@/lib/anode-store"
import { BotGuard } from "@/components/dashboard/bot-guard"

export default function BotOverviewPage() {
  return <BotGuard>{(id) => <Overview id={id} />}</BotGuard>
}

function Overview({ id }: { id: string }) {
  const router = useRouter()
  const { getBot, updateBot, deleteBot } = useAnodeStore()
  const bot = getBot(id)!
  const base = `/dashboard/bot/${id}`

  const trained = bot.sources.filter((s) => s.status === "ready").length
  const canGoLive = trained > 0

  const toggleLive = () => {
    if (bot.status === "live") {
      updateBot(id, { status: "draft" })
    } else if (canGoLive) {
      updateBot(id, { status: "live" })
    }
  }

  const remove = () => {
    deleteBot(id)
    router.push("/dashboard")
  }

  const steps = [
    { href: `${base}/train`, icon: <Database className="h-4 w-4" />, label: "Train", desc: `${trained} of ${bot.sources.length} sources trained` },
    { href: `${base}/build`, icon: <Settings2 className="h-4 w-4" />, label: "Build", desc: "Persona, behavior & appearance" },
    { href: `${base}/test`, icon: <Play className="h-4 w-4" />, label: "Test", desc: "Chat with your assistant live" },
    { href: `${base}/embed`, icon: <Code2 className="h-4 w-4" />, label: "Embed", desc: "Ship as a script or iframe" },
  ]

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          {MODE_META[bot.mode].index} / {MODE_META[bot.mode].label}
        </span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl leading-none tracking-wide text-foreground md:text-5xl">
            {bot.name}
          </h1>
          <button
            onClick={toggleLive}
            disabled={!canGoLive && bot.status !== "live"}
            className={
              bot.status === "live"
                ? "flex items-center gap-2 border border-accent px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent transition-colors hover:bg-accent/10"
                : "flex items-center gap-2 bg-accent px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            }
          >
            <Zap className="h-3.5 w-3.5" />
            {bot.status === "live" ? "Set to draft" : "Set live"}
          </button>
        </div>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">{bot.persona}</p>
        {!canGoLive && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Add at least one trained source before going live.
          </p>
        )}
      </div>

      {/* Flow steps */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {steps.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className="group flex items-center gap-4 border border-border/60 bg-card px-5 py-4 transition-colors hover:border-accent"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border/60 text-muted-foreground transition-colors group-hover:border-accent group-hover:text-accent">
              {step.icon}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Step {i + 1}
              </span>
              <span className="text-sm text-foreground">{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Danger zone */}
      <div className="mt-10 flex items-center justify-between border border-destructive/30 bg-destructive/5 px-5 py-4">
        <div className="flex flex-col">
          <span className="text-sm text-foreground">Delete this assistant</span>
          <span className="text-xs text-muted-foreground">This removes the assistant and its training data.</span>
        </div>
        <button
          onClick={remove}
          className="flex items-center gap-2 border border-destructive/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
