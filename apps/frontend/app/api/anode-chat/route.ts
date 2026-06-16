import { streamText, convertToModelMessages, type UIMessage } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { getMode, retrieve, type KnowledgeChunk } from "@/lib/anode-data"

export const maxDuration = 30

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const MODEL = "gemini-flash-latest"

function getText(message: UIMessage | undefined): string {
  if (!message?.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
}

interface IncomingKnowledge {
  id?: string
  title?: string
  body?: string
  source?: string
}

function buildSystem(instruction: string, chunks: KnowledgeChunk[]): string {
  const context = chunks.length
    ? chunks.map((c) => `[${c.source}] ${c.title}\n${c.body}`).join("\n\n")
    : "(No knowledge has been added yet.)"

  return `${instruction}

KNOWLEDGE BASE (the only facts you may use):
${context}

Rules:
- Answer ONLY from the knowledge base above.
- If the answer is not present in the knowledge base, say you do not have that information yet and suggest what could be added.
- Keep responses under 140 words unless code is required.
- Cite the bracketed source when you use a fact.`
}

export async function POST(req: Request) {
  let messages: UIMessage[] = []
  let mode = "public"
  let customInstruction: string | undefined
  let customKnowledge: IncomingKnowledge[] | undefined
  let temperature = 0.3

  try {
    const body = await req.json()
    messages = Array.isArray(body?.messages) ? body.messages : []
    mode = typeof body?.mode === "string" ? body.mode : "public"
    if (typeof body?.instruction === "string" && body.instruction.trim()) {
      customInstruction = body.instruction
    }
    if (Array.isArray(body?.knowledge)) {
      customKnowledge = body.knowledge
    }
    if (typeof body?.temperature === "number") {
      temperature = Math.min(Math.max(body.temperature, 0), 1)
    }
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response("Missing GOOGLE_GENERATIVE_AI_API_KEY. Add it in Project Settings to enable the assistant.", {
      status: 500,
    })
  }

  // Resolve the knowledge base + instruction. A dashboard bot sends its own
  // instruction + knowledge; the landing demo sends a built-in mode.
  let instruction: string
  let pool: KnowledgeChunk[]

  if (customKnowledge || customInstruction) {
    instruction =
      customInstruction ||
      "You are a helpful AI assistant embedded on a website. Answer only from the provided knowledge base."
    pool = (customKnowledge ?? [])
      .filter((k) => k && typeof k.body === "string" && k.body.trim())
      .map((k, i) => ({
        id: k.id || `k-${i}`,
        title: k.title || "Source",
        body: k.body as string,
        source: k.source || "knowledge",
      }))
  } else {
    const config = getMode(mode)
    instruction = config.instruction
    pool = config.knowledge
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  const query = getText(lastUser)
  const chunks = retrieve(query, pool, 4)
  const system = buildSystem(instruction, chunks)

  let modelMessages
  try {
    modelMessages = await convertToModelMessages(messages)
  } catch {
    return new Response("Could not parse messages", { status: 400 })
  }

  const result = streamText({
    model: google(MODEL),
    system,
    messages: modelMessages,
    temperature,
  })

  return result.toUIMessageStreamResponse()
}
