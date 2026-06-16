"use client"

// Frontend-only data store for the Anode dashboard.
// Seeds sample chatbots and persists edits to localStorage so the
// train -> build -> test flow feels real without any backend or database.

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

export type BotMode = "public" | "private" | "dev"
export type SourceType = "url" | "file" | "text"
export type SourceStatus = "queued" | "training" | "ready" | "error"

export interface KnowledgeSource {
  id: string
  type: SourceType
  name: string
  detail: string // url, filename, or first line of text
  body: string // the actual indexed content
  status: SourceStatus
  chars: number
  addedAt: number
}

export interface BotAppearance {
  accent: string // hex
  radius: number // px
  font: "mono" | "sans"
  position: "bottom-right" | "bottom-left"
  launcherLabel: string
}

export interface Chatbot {
  id: string
  name: string
  mode: BotMode
  status: "draft" | "live"
  persona: string // system instruction
  greeting: string
  temperature: number
  suggestions: string[]
  sources: KnowledgeSource[]
  appearance: BotAppearance
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "anode.dashboard.v1"

function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function now() {
  return Date.now()
}

const DEFAULT_APPEARANCE: BotAppearance = {
  accent: "#ff5c1a",
  radius: 0,
  font: "mono",
  position: "bottom-right",
  launcherLabel: "Ask AI",
}

// ---------------------------------------------------------------------------
// Seed data — three realistic sample bots, one per mode.
// ---------------------------------------------------------------------------
function seedBots(): Chatbot[] {
  return [
    {
      id: "bot-aurora",
      name: "Aurora Storefront",
      mode: "public",
      status: "live",
      persona:
        "You are Aurora, a friendly customer-facing assistant for the Aurora coffee subscription store. Answer only from the knowledge base. Be warm, concise, and never invent prices or shipping policies.",
      greeting: "Hi! I'm Aurora. Ask me about our coffee plans, shipping, or returns.",
      temperature: 0.4,
      suggestions: ["What plans do you offer?", "How fast is shipping?", "Can I pause my subscription?"],
      appearance: { ...DEFAULT_APPEARANCE, accent: "#ff5c1a", launcherLabel: "Ask Aurora" },
      sources: [
        {
          id: uid("src"),
          type: "url",
          name: "Pricing page",
          detail: "aurora.coffee/pricing",
          body: "Aurora offers three subscription plans: Starter at $18/month (2 bags), Plus at $32/month (4 bags), and Pro at $60/month (8 bags). All plans ship free and can be paused or cancelled anytime from your account.",
          status: "ready",
          chars: 248,
          addedAt: now() - 86400000,
        },
        {
          id: uid("src"),
          type: "text",
          name: "Shipping policy",
          detail: "Orders ship within 1 business day...",
          body: "Orders ship within 1 business day via carbon-neutral courier. Delivery takes 2-4 business days in the continental US. International shipping is available to 40 countries at a flat $9 rate.",
          status: "ready",
          chars: 196,
          addedAt: now() - 80000000,
        },
        {
          id: uid("src"),
          type: "text",
          name: "Returns & pausing",
          detail: "You can pause anytime...",
          body: "You can pause or skip a delivery anytime before your billing date. Unopened bags can be returned within 30 days for a full refund. Opened bags are covered by our freshness guarantee — contact support for a replacement.",
          status: "ready",
          chars: 232,
          addedAt: now() - 70000000,
        },
      ],
      createdAt: now() - 90000000,
      updatedAt: now() - 70000000,
    },
    {
      id: "bot-helm",
      name: "Helm Internal Copilot",
      mode: "private",
      status: "live",
      persona:
        "You are the Helm internal copilot inside the Helm analytics dashboard. Guide teammates through features step by step using only the internal knowledge base. Reference exact dashboard paths.",
      greeting: "Hey there — I can help you navigate Helm. What do you need?",
      temperature: 0.2,
      suggestions: ["How do I invite a teammate?", "Where are saved reports?", "How do I export data?"],
      appearance: { ...DEFAULT_APPEARANCE, accent: "#2f6df6", font: "sans", launcherLabel: "Copilot" },
      sources: [
        {
          id: uid("src"),
          type: "text",
          name: "Inviting teammates",
          detail: "Go to Settings -> Team...",
          body: "To invite a teammate, go to Settings -> Team -> Invite. Enter their email and choose a role (Viewer, Editor, Admin). They receive an email link valid for 7 days.",
          status: "ready",
          chars: 178,
          addedAt: now() - 50000000,
        },
        {
          id: uid("src"),
          type: "text",
          name: "Saved reports",
          detail: "Reports live under Insights...",
          body: "Saved reports live under Insights -> Saved. You can pin a report to your home dashboard by clicking the star icon. Reports refresh every 15 minutes.",
          status: "ready",
          chars: 162,
          addedAt: now() - 40000000,
        },
        {
          id: uid("src"),
          type: "text",
          name: "Exporting data",
          detail: "Export from any table...",
          body: "Any data table can be exported as CSV or JSON from the table's overflow menu (top right) -> Export. Exports respect your current filters and column selection.",
          status: "ready",
          chars: 170,
          addedAt: now() - 30000000,
        },
      ],
      createdAt: now() - 60000000,
      updatedAt: now() - 30000000,
    },
    {
      id: "bot-quill",
      name: "Quill SDK Docs",
      mode: "dev",
      status: "draft",
      persona:
        "You are the Quill SDK support assistant. Answer developer questions using only the SDK documentation. Use code snippets and be technical and direct.",
      greeting: "Quill docs assistant here. Ask me anything about the SDK.",
      temperature: 0.3,
      suggestions: ["How do I install Quill?", "How do I authenticate?", "Show me a basic example"],
      appearance: { ...DEFAULT_APPEARANCE, accent: "#16a34a", launcherLabel: "Docs AI" },
      sources: [
        {
          id: uid("src"),
          type: "url",
          name: "Install guide",
          detail: "docs.quill.dev/install",
          body: "Install Quill with `npm i @quill/sdk`. Import the client: `import { Quill } from '@quill/sdk'`. Initialize with `const q = new Quill({ apiKey })`.",
          status: "ready",
          chars: 156,
          addedAt: now() - 20000000,
        },
        {
          id: uid("src"),
          type: "text",
          name: "Authentication",
          detail: "Pass your API key...",
          body: "Authenticate by passing your API key to the constructor. Keys are scoped per-project and can be rotated from the Quill dashboard under Settings -> API Keys. Never expose secret keys in client code.",
          status: "ready",
          chars: 204,
          addedAt: now() - 10000000,
        },
        {
          id: uid("src"),
          type: "text",
          name: "Quick example",
          detail: "const res = await q.query(...)",
          body: "Basic usage: `const res = await q.query({ prompt: 'Hello' })`. The response is a promise resolving to `{ text, usage }`. Use `q.stream()` for token streaming.",
          status: "queued",
          chars: 164,
          addedAt: now() - 5000000,
        },
      ],
      createdAt: now() - 25000000,
      updatedAt: now() - 5000000,
    },
  ]
}

interface StoreShape {
  bots: Chatbot[]
  ready: boolean
  getBot: (id: string) => Chatbot | undefined
  createBot: (input: { name: string; mode: BotMode }) => Chatbot
  updateBot: (id: string, patch: Partial<Chatbot>) => void
  deleteBot: (id: string) => void
  addSource: (botId: string, input: { type: SourceType; name: string; detail: string; body: string }) => void
  removeSource: (botId: string, sourceId: string) => void
  retrainSource: (botId: string, sourceId: string) => void
}

const StoreContext = createContext<StoreShape | null>(null)

export function AnodeStoreProvider({ children }: { children: ReactNode }) {
  const [bots, setBots] = useState<Chatbot[]>([])
  const [ready, setReady] = useState(false)

  // Load from localStorage or seed.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Chatbot[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBots(parsed)
          setReady(true)
          return
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setBots(seedBots())
    setReady(true)
  }, [])

  // Persist on change.
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bots))
    } catch {
      // storage full / unavailable — non-fatal
    }
  }, [bots, ready])

  const getBot = useCallback((id: string) => bots.find((b) => b.id === id), [bots])

  const createBot = useCallback((input: { name: string; mode: BotMode }) => {
    const bot: Chatbot = {
      id: uid("bot"),
      name: input.name.trim() || "Untitled assistant",
      mode: input.mode,
      status: "draft",
      persona:
        input.mode === "dev"
          ? "You are a developer support assistant. Answer using only the provided documentation. Use code snippets and be direct."
          : input.mode === "private"
            ? "You are an internal product assistant. Guide users step by step using only the internal knowledge base."
            : "You are a friendly customer-facing assistant. Answer using only the provided knowledge base and never invent details.",
      greeting: "Hi! How can I help you today?",
      temperature: 0.3,
      suggestions: ["What can you do?", "Tell me about pricing", "How do I get started?"],
      sources: [],
      appearance: { ...DEFAULT_APPEARANCE },
      createdAt: now(),
      updatedAt: now(),
    }
    setBots((prev) => [bot, ...prev])
    return bot
  }, [])

  const updateBot = useCallback((id: string, patch: Partial<Chatbot>) => {
    setBots((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now() } : b)))
  }, [])

  const deleteBot = useCallback((id: string) => {
    setBots((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const addSource = useCallback(
    (botId: string, input: { type: SourceType; name: string; detail: string; body: string }) => {
      const source: KnowledgeSource = {
        id: uid("src"),
        type: input.type,
        name: input.name,
        detail: input.detail,
        body: input.body,
        status: "training",
        chars: input.body.length,
        addedAt: now(),
      }
      setBots((prev) =>
        prev.map((b) => (b.id === botId ? { ...b, sources: [source, ...b.sources], updatedAt: now() } : b)),
      )
      // Simulate a training run completing.
      setTimeout(() => {
        setBots((prev) =>
          prev.map((b) =>
            b.id === botId
              ? {
                  ...b,
                  sources: b.sources.map((s) => (s.id === source.id ? { ...s, status: "ready" as const } : s)),
                }
              : b,
          ),
        )
      }, 1800)
    },
    [],
  )

  const removeSource = useCallback((botId: string, sourceId: string) => {
    setBots((prev) =>
      prev.map((b) =>
        b.id === botId ? { ...b, sources: b.sources.filter((s) => s.id !== sourceId), updatedAt: now() } : b,
      ),
    )
  }, [])

  const retrainSource = useCallback((botId: string, sourceId: string) => {
    setBots((prev) =>
      prev.map((b) =>
        b.id === botId
          ? { ...b, sources: b.sources.map((s) => (s.id === sourceId ? { ...s, status: "training" as const } : s)) }
          : b,
      ),
    )
    setTimeout(() => {
      setBots((prev) =>
        prev.map((b) =>
          b.id === botId
            ? { ...b, sources: b.sources.map((s) => (s.id === sourceId ? { ...s, status: "ready" as const } : s)) }
            : b,
        ),
      )
    }, 1800)
  }, [])

  const value: StoreShape = {
    bots,
    ready,
    getBot,
    createBot,
    updateBot,
    deleteBot,
    addSource,
    removeSource,
    retrainSource,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useAnodeStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useAnodeStore must be used within AnodeStoreProvider")
  return ctx
}

export const MODE_META: Record<BotMode, { label: string; index: string; blurb: string }> = {
  public: { label: "Public", index: "01", blurb: "Customer-facing widget on a public site" },
  private: { label: "Private", index: "02", blurb: "Internal assistant inside your dashboard" },
  dev: { label: "Dev", index: "03", blurb: "Open-source SDK for docs and apps" },
}
