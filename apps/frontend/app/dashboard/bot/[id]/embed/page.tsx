"use client"

import { useState } from "react"
import { Copy, Check, Zap, AlertTriangle } from "lucide-react"
import { useAnodeStore } from "@/lib/anode-store"
import { BotGuard } from "@/components/dashboard/bot-guard"
import { cn } from "@/lib/utils"

export default function EmbedPage() {
  return <BotGuard>{(id) => <Embed id={id} />}</BotGuard>
}

type Snippet = "script" | "iframe" | "react"

function Embed({ id }: { id: string }) {
  const { getBot } = useAnodeStore()
  const bot = getBot(id)!
  const [tab, setTab] = useState<Snippet>("script")
  const [copied, setCopied] = useState(false)

  const trained = bot.sources.filter((s) => s.status === "ready").length
  const isLive = bot.status === "live"

  const snippets: Record<Snippet, string> = {
    script: `<!-- Anode assistant — ${bot.name} -->
<script
  src="https://cdn.anode.ai/widget.js"
  data-bot-id="${bot.id}"
  data-mode="${bot.mode}"
  data-accent="${bot.appearance.accent}"
  data-position="${bot.appearance.position}"
  data-label="${bot.appearance.launcherLabel}"
  defer
></script>`,
    iframe: `<iframe
  src="https://embed.anode.ai/${bot.id}"
  title="${bot.name}"
  style="border:0;width:380px;height:560px;border-radius:${bot.appearance.radius}px"
  allow="clipboard-write"
></iframe>`,
    react: `import { AnodeWidget } from "@anode/sdk"

export function Assistant() {
  return (
    <AnodeWidget
      botId="${bot.id}"
      mode="${bot.mode}"
      accent="${bot.appearance.accent}"
      label="${bot.appearance.launcherLabel}"
    />
  )
}`,
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[tab])
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable
    }
  }

  const TABS: { key: Snippet; label: string }[] = [
    { key: "script", label: "Script tag" },
    { key: "iframe", label: "iframe" },
    { key: "react", label: "React" },
  ]

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Embed</span>
        <h2 className="font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-foreground md:text-4xl">
          Ship it anywhere
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Drop your trained assistant into any site with one snippet. No framework lock-in.
        </p>
      </div>

      {/* Readiness checks */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Status
          ok={trained > 0}
          okText={`${trained} source${trained === 1 ? "" : "s"} trained`}
          badText="No trained sources yet"
        />
        <Status ok={isLive} okText="Assistant is live" badText="Assistant is in draft — set it live to serve traffic" />
      </div>

      {/* Snippet box */}
      <div className="mt-6 border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60">
          <div className="flex">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
                  tab === t.key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={copy}
            className="mr-3 flex items-center gap-2 border border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-foreground/90 scrollbar-thin">
          <code>{snippets[tab]}</code>
        </pre>
      </div>

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
        This is a demo snippet — the CDN endpoint is illustrative. Your bot id{" "}
        <span className="text-foreground">{bot.id}</span> and configuration are real and saved in this workspace.
      </p>
    </div>
  )
}

function Status({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border px-4 py-3",
        ok ? "border-accent/40 bg-accent/5" : "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <span className={ok ? "text-accent" : "text-amber-500"}>
        {ok ? <Zap className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      </span>
      <span className="text-xs text-foreground">{ok ? okText : badText}</span>
    </div>
  )
}
