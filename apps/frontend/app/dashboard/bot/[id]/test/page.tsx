"use client"

import { useState } from "react"
import { MessageSquare, PanelRight, Maximize2, MousePointerClick } from "lucide-react"
import { useAnodeStore } from "@/lib/anode-store"
import { ConfigurableWidget } from "@/components/dashboard/configurable-widget"
import { BotGuard } from "@/components/dashboard/bot-guard"
import { cn } from "@/lib/utils"

export default function TestPage() {
  return <BotGuard>{(id) => <Test id={id} />}</BotGuard>
}

type Surface = "popup" | "inline" | "fullscreen"

const SURFACES: { key: Surface; label: string; icon: React.ReactNode; hint: string }[] = [
  { key: "popup", label: "Floating popup", icon: <MessageSquare className="h-3.5 w-3.5" />, hint: "Public mode — launcher on a marketing site" },
  { key: "inline", label: "Inline panel", icon: <PanelRight className="h-3.5 w-3.5" />, hint: "Private mode — docked in a dashboard" },
  { key: "fullscreen", label: "Fullscreen", icon: <Maximize2 className="h-3.5 w-3.5" />, hint: "Dev mode — docs search experience" },
]

function Test({ id }: { id: string }) {
  const { getBot } = useAnodeStore()
  const bot = getBot(id)!
  const [surface, setSurface] = useState<Surface>("popup")
  const [open, setOpen] = useState(false)

  const trained = bot.sources.filter((s) => s.status === "ready").length
  const activeHint = SURFACES.find((s) => s.key === surface)!.hint

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Test</span>
          <h2 className="font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-foreground md:text-4xl">
            Live playground
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Chat with your assistant exactly as visitors will. Powered by Gemini, grounded in your{" "}
            <span className="text-foreground">{trained}</span> trained source{trained === 1 ? "" : "s"}.
          </p>
        </div>

        {/* Surface switcher */}
        <div className="flex border border-border/60">
          {SURFACES.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setSurface(s.key)
                setOpen(false)
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                surface === s.key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{activeHint}</p>

      {/* Stage — a faux browser frame hosting the widget */}
      <div className="mt-6 overflow-hidden border border-border/60 bg-card">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="ml-3 flex-1 truncate bg-background px-3 py-1 font-mono text-[10px] text-muted-foreground">
            https://your-site.com
          </span>
        </div>

        {/* Stage body */}
        <div className="relative min-h-[560px] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px]">
          {surface === "fullscreen" && (
            <div className="flex justify-center p-4 md:p-8">
              <ConfigurableWidget bot={bot} inline className="h-[560px] w-full max-w-2xl" />
            </div>
          )}

          {surface === "inline" && (
            <div className="flex min-h-[560px]">
              {/* Fake dashboard content */}
              <div className="hidden flex-1 flex-col gap-3 p-8 md:flex">
                <div className="h-6 w-40 bg-muted" />
                <div className="h-3 w-full max-w-md bg-muted/60" />
                <div className="h-3 w-full max-w-sm bg-muted/60" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-24 bg-muted/40" />
                  <div className="h-24 bg-muted/40" />
                </div>
              </div>
              <div className="w-full border-l border-border/60 md:w-[400px]">
                <ConfigurableWidget bot={bot} inline className="h-[560px] w-full" />
              </div>
            </div>
          )}

          {surface === "popup" && (
            <>
              {/* Fake page content */}
              <div className="flex flex-col gap-3 p-8">
                <div className="h-8 w-56 bg-muted" />
                <div className="h-3 w-full max-w-lg bg-muted/60" />
                <div className="h-3 w-full max-w-md bg-muted/60" />
              </div>

              {/* Floating widget */}
              <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
                {open && <ConfigurableWidget bot={bot} onClose={() => setOpen(false)} />}
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground shadow-lg transition-transform hover:scale-105"
                  style={{ background: bot.appearance.accent, borderRadius: bot.appearance.radius }}
                >
                  {open ? <MousePointerClick className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  {bot.appearance.launcherLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
