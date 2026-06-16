"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useEffect, useRef, useState } from "react"
import { ArrowUp, X, Square, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Chatbot } from "@/lib/anode-store"

interface ConfigurableWidgetProps {
  bot: Chatbot
  inline?: boolean
  className?: string
  onClose?: () => void
}

function messageText(parts: { type: string; text?: string }[] | undefined): string {
  if (!parts) return ""
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")
}

const MODE_INDEX: Record<string, string> = { public: "01", private: "02", dev: "03" }

export function ConfigurableWidget({ bot, inline = false, className, onClose }: ConfigurableWidgetProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Only ready sources are sent to the model — mirrors a real trained index.
  const readySources = bot.sources.filter((s) => s.status === "ready")

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    id: `anode-test-${bot.id}`,
    transport: new DefaultChatTransport({
      api: "/api/anode-chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          mode: bot.mode,
          instruction: bot.persona,
          temperature: bot.temperature,
          knowledge: readySources.map((s) => ({
            id: s.id,
            title: s.name,
            body: s.body,
            source: s.detail,
          })),
        },
      }),
    }),
  })

  // Reset when the bot identity changes.
  useEffect(() => {
    setMessages([])
    setInput("")
  }, [bot.id, setMessages])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, status])

  const isBusy = status === "streaming" || status === "submitted"

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  const accentStyle = { "--accent": bot.appearance.accent } as React.CSSProperties
  const fontClass = bot.appearance.font === "sans" ? "font-sans" : "font-mono"

  return (
    <div
      style={{ ...accentStyle, borderRadius: bot.appearance.radius }}
      className={cn(
        "flex flex-col bg-background border border-border/60 overflow-hidden",
        inline ? "h-full w-full" : "h-[560px] w-[380px] shadow-2xl shadow-black/50",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2" style={{ background: bot.appearance.accent }} aria-hidden="true" />
          <div className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wide text-foreground">
              {bot.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              {MODE_INDEX[bot.mode]} / {bot.mode} mode
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              aria-label="Reset conversation"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close assistant"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col">
            <p className={cn("text-xs leading-relaxed text-muted-foreground", fontClass)}>{bot.greeting}</p>
            {readySources.length === 0 && (
              <p className="mt-3 border border-dashed border-border/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                No trained sources yet. Add knowledge on the Train tab — the assistant will only answer from what it
                knows.
              </p>
            )}
            <div className="mt-auto flex flex-col gap-2 pt-4">
              {bot.suggestions.filter(Boolean).map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className={cn(
                    "group flex items-center justify-between border border-border/60 px-3 py-2 text-left transition-colors hover:border-accent",
                  )}
                >
                  <span className={cn("text-[11px] text-foreground/80 group-hover:text-foreground", fontClass)}>
                    {s}
                  </span>
                  <ArrowUp className="h-3 w-3 rotate-45 text-muted-foreground group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  {m.role === "user" ? "You" : bot.name}
                </span>
                <div
                  className={cn(
                    "max-w-[90%] whitespace-pre-wrap px-3 py-2 text-xs leading-relaxed",
                    fontClass,
                    m.role === "user" ? "text-accent-foreground" : "border border-border/60 bg-card text-foreground/90",
                  )}
                  style={m.role === "user" ? { background: bot.appearance.accent } : undefined}
                >
                  {messageText(m.parts) || (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse bg-accent" />
                      <span className="h-1.5 w-1.5 animate-pulse bg-accent [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse bg-accent [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            {error && <p className="font-mono text-[11px] text-destructive">Connection error. Please try again.</p>}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="border-t border-border/60 bg-card p-3"
      >
        <div className="flex items-end gap-2 border border-border/60 bg-background px-3 py-2 transition-colors focus-within:border-accent">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                submit(input)
              }
            }}
            rows={1}
            placeholder="Type a message…"
            className={cn(
              "flex-1 resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none",
              fontClass,
            )}
            aria-label="Message assistant"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              className="flex h-7 w-7 shrink-0 items-center justify-center bg-muted text-foreground transition-colors hover:bg-muted/70"
            >
              <Square className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-7 w-7 shrink-0 items-center justify-center text-accent-foreground transition-opacity disabled:opacity-30"
              style={{ background: bot.appearance.accent }}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center font-mono text-[9px] text-muted-foreground/60">
          AI-generated content may be inaccurate.
        </p>
      </form>
    </div>
  )
}
