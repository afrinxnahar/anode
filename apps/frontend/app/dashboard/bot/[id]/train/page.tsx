"use client"

import { useState } from "react"
import { Link2, FileText, Type, Trash2, RotateCcw, Check, Loader2, AlertCircle, Plus, Database } from "lucide-react"
import { useAnodeStore, type SourceType, type KnowledgeSource } from "@/lib/anode-store"
import { BotGuard } from "@/components/dashboard/bot-guard"
import { cn } from "@/lib/utils"

export default function TrainPage() {
  return <BotGuard>{(id) => <Train id={id} />}</BotGuard>
}

const TYPE_TABS: { key: SourceType; label: string; icon: React.ReactNode }[] = [
  { key: "url", label: "Website URL", icon: <Link2 className="h-3.5 w-3.5" /> },
  { key: "text", label: "Paste text", icon: <Type className="h-3.5 w-3.5" /> },
  { key: "file", label: "Upload file", icon: <FileText className="h-3.5 w-3.5" /> },
]

function Train({ id }: { id: string }) {
  const { getBot, addSource, removeSource, retrainSource } = useAnodeStore()
  const bot = getBot(id)!

  const [type, setType] = useState<SourceType>("url")
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileBody, setFileBody] = useState("")

  const canAdd = type === "url" ? url.trim().length > 3 : type === "text" ? text.trim().length > 10 : fileBody.length > 0

  const handleAdd = () => {
    if (!canAdd) return
    if (type === "url") {
      const clean = url.trim().replace(/^https?:\/\//, "")
      addSource(id, {
        type: "url",
        name: clean.split("/")[0] || clean,
        detail: clean,
        // Frontend-only: we can't really scrape, so we store a representative note.
        body: `Content scraped from ${clean}. (Demo: paste real page text via "Paste text" for grounded answers.)`,
      })
      setUrl("")
    } else if (type === "text") {
      const firstLine = text.trim().split("\n")[0].slice(0, 60)
      addSource(id, { type: "text", name: firstLine || "Pasted text", detail: "Pasted text", body: text.trim() })
      setText("")
    } else {
      addSource(id, { type: "file", name: fileName, detail: fileName, body: fileBody })
      setFileName("")
      setFileBody("")
    }
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    try {
      const content = await file.text()
      setFileBody(content.slice(0, 20000))
    } catch {
      setFileBody(`Uploaded ${file.name}`)
    }
  }

  const trained = bot.sources.filter((s) => s.status === "ready").length

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Train</span>
        <h2 className="font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-foreground md:text-4xl">
          Knowledge sources
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Add what your assistant should know. It answers strictly from these sources — nothing else. Pasted text and
          uploaded files are indexed verbatim for grounded answers.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Add source */}
        <div className="lg:col-span-2">
          <div className="border border-border/60 bg-card">
            <div className="flex border-b border-border/60">
              {TYPE_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 px-2 py-3 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                    type === t.key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {type === "url" && (
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Page URL
                  </span>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="docs.yoursite.com/guide"
                    className="mt-2 w-full border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
                  />
                </label>
              )}
              {type === "text" && (
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Knowledge text
                  </span>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    placeholder="Paste a policy, FAQ, product details, docs…"
                    className="mt-2 w-full resize-y border border-border/60 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none"
                  />
                </label>
              )}
              {type === "file" && (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border/60 px-4 py-8 text-center transition-colors hover:border-accent">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-foreground">{fileName || "Choose a .txt, .md, .csv, .json file"}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Indexed in-browser</span>
                  <input
                    type="file"
                    accept=".txt,.md,.markdown,.csv,.json,.html"
                    onChange={onFile}
                    className="hidden"
                  />
                </label>
              )}

              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className="mt-4 flex w-full items-center justify-center gap-2 bg-accent px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add & train source
              </button>
            </div>
          </div>
        </div>

        {/* Source list */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {bot.sources.length} sources · {trained} trained
            </span>
          </div>

          {bot.sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 px-6 py-16 text-center">
              <Database className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-foreground">No knowledge yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Add a source on the left. Your assistant can&apos;t answer until it&apos;s trained on something.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {bot.sources.map((s) => (
                <SourceRow
                  key={s.id}
                  source={s}
                  onRemove={() => removeSource(id, s.id)}
                  onRetrain={() => retrainSource(id, s.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SourceRow({
  source,
  onRemove,
  onRetrain,
}: {
  source: KnowledgeSource
  onRemove: () => void
  onRetrain: () => void
}) {
  const typeIcon =
    source.type === "url" ? <Link2 className="h-3.5 w-3.5" /> : source.type === "file" ? <FileText className="h-3.5 w-3.5" /> : <Type className="h-3.5 w-3.5" />

  return (
    <li className="flex items-center gap-3 border border-border/60 bg-card px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border/60 text-muted-foreground">
        {typeIcon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm text-foreground">{source.name}</span>
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {source.detail} · {source.chars} chars
        </span>
      </div>
      <StatusBadge status={source.status} />
      <div className="flex items-center gap-1">
        <button
          onClick={onRetrain}
          aria-label="Retrain source"
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRemove}
          aria-label="Remove source"
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: KnowledgeSource["status"] }) {
  if (status === "ready")
    return (
      <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-accent">
        <Check className="h-3 w-3" /> Ready
      </span>
    )
  if (status === "training" || status === "queued")
    return (
      <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Training
      </span>
    )
  return (
    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-destructive">
      <AlertCircle className="h-3 w-3" /> Error
    </span>
  )
}
