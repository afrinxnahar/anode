"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useEffect, useRef, useState } from "react"
import { ArrowUp, X, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMode, type AnodeMode } from "@/lib/anode-data"

interface AnodeWidgetProps {
  mode: AnodeMode
  /** When true, renders inline (embedded in a frame) instead of a floating popup. */
  inline?: boolean
  className?: string
  /** Optional accent override to demo per-site theming. */
  accent?: string
  onClose?: () => void
}

function messageText(parts: { type: string; text?: string }[] | undefined): string {
  if (!parts) return ""
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")
}

export function AnodeWidget({ mode, inline = false, className, accent, onClose }: AnodeWidgetProps) {
  const config = getMode(mode)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    id: `anode-${mode}`,
    transport: new DefaultChatTransport({
      api: "/api/anode-chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, mode },
      }),
    }),
  })

  // Reset the conversation whenever the active mode changes.
  useEffect(() => {
    setMessages([])
    setInput("")
  }, [mode, setMessages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, status])

  const isBusy = status === "streaming" || status === "submitted"

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(input)
  }

  const accentStyle = accent ? ({ "--accent": accent } as React.CSSProperties) : undefined

  return (
    <div
      style={accentStyle}
      className={cn(
        "flex flex-col bg-background border border-border/60 overflow-hidden",
        inline ? "h-full w-full" : "h-[520px] w-[360px] shadow-2xl shadow-black/50",
        className,
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 bg-accent" aria-hidden="true" />
          <div className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wide text-foreground">ANODE</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              {config.index} / {config.label} Mode
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col">
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              {config.tagline} assistant. Ask about{" "}
              <span className="text-foreground">{config.label.toLowerCase()}</span> topics below.
            </p>
            <div className="mt-auto flex flex-col gap-2">
              {config.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="group flex items-center justify-between border border-border/60 px-3 py-2 text-left transition-colors hover:border-accent"
                >
                  <span className="font-mono text-[11px] text-foreground/80 group-hover:text-foreground">{s}</span>
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
                  {m.role === "user" ? "You" : "Anode"}
                </span>
                <div
                  className={cn(
                    "max-w-[90%] whitespace-pre-wrap px-3 py-2 font-mono text-xs leading-relaxed",
                    m.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "border border-border/60 bg-card text-foreground/90",
                  )}
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
            {error && (
              <p className="font-mono text-[11px] text-destructive">
                Connection error. Please try again.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="border-t border-border/60 bg-card p-3">
        <div className="flex items-end gap-2 border border-border/60 bg-background px-3 py-2 focus-within:border-accent transition-colors">
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
            placeholder="Ask Anode…"
            className="flex-1 resize-none bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            aria-label="Message Anode"
          />
          {isBusy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop generating"
              className="flex h-7 w-7 shrink-0 items-center justify-center bg-muted text-foreground hover:bg-muted/70 transition-colors"
            >
              <Square className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-7 w-7 shrink-0 items-center justify-center bg-accent text-accent-foreground transition-opacity disabled:opacity-30"
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
