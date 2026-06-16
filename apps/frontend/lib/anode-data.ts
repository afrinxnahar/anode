// Sample, raw, standalone data used to power the Anode demo without a backend or database.
// Each "mode" carries its own knowledge base, system instruction, and suggested prompts.

export type AnodeMode = "public" | "private" | "dev"

export interface KnowledgeChunk {
  id: string
  title: string
  body: string
  source: string
}

export interface ModeConfig {
  id: AnodeMode
  label: string
  index: string
  tagline: string
  description: string
  instruction: string
  suggestions: string[]
  knowledge: KnowledgeChunk[]
}

// ---------------------------------------------------------------------------
// PUBLIC MODE — a marketing-site assistant trained on public company data.
// ---------------------------------------------------------------------------
const publicKnowledge: KnowledgeChunk[] = [
  {
    id: "pub-1",
    title: "What Anode is",
    body: "Anode is an LLM-powered AI assistant that embeds into any website. It runs in three modes — Public, Private, and Dev — and adapts its look and tone to match the host site automatically.",
    source: "anode.ai/product",
  },
  {
    id: "pub-2",
    title: "Pricing overview",
    body: "The Dev SDK is free and fully open source. Public and Private modes require a one-time setup payment for a fully managed install handled by the Anode team — no recurring subscription.",
    source: "anode.ai/pricing",
  },
  {
    id: "pub-3",
    title: "Integration",
    body: "Once trained, the final assistant ships as a single <script> tag or an <iframe>. No framework lock-in — it works on static sites, dashboards, and documentation portals.",
    source: "anode.ai/docs/install",
  },
  {
    id: "pub-4",
    title: "Supported data",
    body: "Train Anode by pasting a website URL or uploading data in any format — PDF, Markdown, CSV, JSON, HTML, plain text. Anode scrapes the site, learns its content, and mirrors its visual style.",
    source: "anode.ai/docs/training",
  },
  {
    id: "pub-5",
    title: "Security",
    body: "Private-mode installs are configured by the Anode team without exposing internal data. Customer keys and private context never leave the customer environment.",
    source: "anode.ai/security",
  },
]

// ---------------------------------------------------------------------------
// PRIVATE MODE — an in-dashboard assistant with internal product knowledge.
// ---------------------------------------------------------------------------
const privateKnowledge: KnowledgeChunk[] = [
  {
    id: "prv-1",
    title: "Dashboard: Training tab",
    body: "The Training tab is where you add knowledge. Paste a URL to scrape, drag files to upload, or connect a data source. Each training run produces a new versioned index you can roll back to.",
    source: "dashboard/training",
  },
  {
    id: "prv-2",
    title: "Dashboard: Appearance",
    body: "Appearance lets you override the auto-detected theme. Anode reads your site's fonts, radius, and accent color on first scrape, but you can lock specific tokens here.",
    source: "dashboard/appearance",
  },
  {
    id: "prv-3",
    title: "Dashboard: Model keys",
    body: "Under Settings → Model, paste your own provider API key (OpenAI, Anthropic, Google) to route inference through your account. Training context is still stored so the assistant has your data.",
    source: "dashboard/settings/model",
  },
  {
    id: "prv-4",
    title: "Task: Reset a user password",
    body: "To reset a teammate's password, open Team → Members, select the user, and choose 'Send reset link'. The assistant can trigger this flow for you on request.",
    source: "dashboard/team",
  },
  {
    id: "prv-5",
    title: "Task: Export conversations",
    body: "Conversation logs can be exported as JSON or CSV from Insights → Export. Exports are scoped to your workspace and respect member-level permissions.",
    source: "dashboard/insights",
  },
]

// ---------------------------------------------------------------------------
// DEV MODE — an open-source SDK support assistant for developers.
// ---------------------------------------------------------------------------
const devKnowledge: KnowledgeChunk[] = [
  {
    id: "dev-1",
    title: "Install the SDK",
    body: "Install with `npm i @anode/sdk` or `pnpm add @anode/sdk`. Import the `Anode` provider and wrap your app, or drop the `<AnodeWidget />` component anywhere.",
    source: "github.com/anode/sdk#install",
  },
  {
    id: "dev-2",
    title: "Bring your own model",
    body: "Pass `modelKey` and `provider` to the provider component. The SDK never proxies your key — calls go straight from the client or your own edge function.",
    source: "github.com/anode/sdk#byo-model",
  },
  {
    id: "dev-3",
    title: "Theming the widget",
    body: "Override CSS variables: --anode-accent, --anode-radius, --anode-font. Or pass a `theme` object. The widget inherits your site's color scheme by default.",
    source: "github.com/anode/sdk#theming",
  },
  {
    id: "dev-4",
    title: "Docs-site mode",
    body: "For documentation sites, enable `docsMode: true` to index your MDX/Markdown at build time and answer questions with inline citations and deep links to headings.",
    source: "github.com/anode/sdk#docs-mode",
  },
  {
    id: "dev-5",
    title: "License",
    body: "The Dev SDK is MIT licensed and fully open source. No setup fee, no account required. Public and Private modes are managed paid installs.",
    source: "github.com/anode/sdk/blob/main/LICENSE",
  },
]

export const MODES: Record<AnodeMode, ModeConfig> = {
  public: {
    id: "public",
    label: "Public",
    index: "01",
    tagline: "Customer-facing",
    description:
      "A pop-up assistant on any public page. Knows everything public about the company, product, and services. Handles customer queries from your live data and links.",
    instruction:
      "You are Anode in PUBLIC mode — a friendly customer-facing assistant embedded on a company's public website. Answer using ONLY the provided knowledge base. Be concise and helpful, cite the source path when relevant, and if you do not know, say so and suggest contacting the team. Never invent pricing or features.",
    suggestions: ["What is Anode?", "How much does it cost?", "How do I install it?", "What data can I train it on?"],
    knowledge: publicKnowledge,
  },
  private: {
    id: "private",
    label: "Private",
    index: "02",
    tagline: "Internal dashboard",
    description:
      "An internal assistant that lives inside your dashboard. Knows your features, guides, and private context. Guides users, surfaces links, and handles basic tasks.",
    instruction:
      "You are Anode in PRIVATE mode — an internal assistant inside a product dashboard. You know the dashboard's features and can guide users step by step. Answer using ONLY the provided internal knowledge base. When a task is requested (resets, exports), describe the exact steps. Be precise and reference the dashboard path.",
    suggestions: [
      "How do I train the assistant?",
      "Where do I add my model key?",
      "How do I reset a teammate's password?",
      "Can I export conversations?",
    ],
    knowledge: privateKnowledge,
  },
  dev: {
    id: "dev",
    label: "Dev",
    index: "03",
    tagline: "Open-source SDK",
    description:
      "A fully open-source SDK / npm package. Drop it into any docs site or app, bring your own model API key, and ship support in minutes.",
    instruction:
      "You are Anode in DEV mode — a developer support assistant for the open-source Anode SDK. Answer using ONLY the provided SDK documentation. Use code snippets where helpful, reference the GitHub anchors, and keep answers technical and direct.",
    suggestions: [
      "How do I install the SDK?",
      "Can I use my own model key?",
      "How do I theme the widget?",
      "Is it really open source?",
    ],
    knowledge: devKnowledge,
  },
}

export const MODE_LIST: ModeConfig[] = [MODES.public, MODES.private, MODES.dev]

export function getMode(mode: string | undefined): ModeConfig {
  if (mode === "private") return MODES.private
  if (mode === "dev") return MODES.dev
  return MODES.public
}

// Lightweight keyword retrieval over a knowledge base — no embeddings, no DB.
export function retrieve(query: string, knowledge: KnowledgeChunk[], limit = 3): KnowledgeChunk[] {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)

  if (terms.length === 0) return knowledge.slice(0, limit)

  const scored = knowledge.map((chunk) => {
    const haystack = `${chunk.title} ${chunk.body}`.toLowerCase()
    let score = 0
    for (const term of terms) {
      if (haystack.includes(term)) score += 1
    }
    return { chunk, score }
  })

  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.chunk)

  return (ranked.length > 0 ? ranked : knowledge).slice(0, limit)
}
