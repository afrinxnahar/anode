"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Copy } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const snippets = {
  script: `<!-- Drop this before </body> -->
<script
  src="https://cdn.anode.ai/embed.js"
  data-anode-id="your-bot-id"
  data-mode="public"
  defer
></script>`,
  iframe: `<!-- Or embed as an iframe -->
<iframe
  src="https://embed.anode.ai/your-bot-id"
  style="border:0;width:380px;height:560px"
  title="Anode Assistant"
></iframe>`,
  npm: `# Dev SDK — open source
npm i @anode/sdk

import { AnodeWidget } from "@anode/sdk"

<AnodeWidget
  modelKey={process.env.MODEL_KEY}
  provider="google"
/>`,
}

type Tab = keyof typeof snippets

const tabs: { id: Tab; label: string }[] = [
  { id: "script", label: "Script Tag" },
  { id: "iframe", label: "iFrame" },
  { id: "npm", label: "Dev SDK" },
]

export function AnodeIntegration() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Tab>("script")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: headerRef.current, start: "top 85%", toggleActions: "play none none reverse" },
        })
      }
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: cardRef.current, start: "top 88%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[active])
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <section ref={sectionRef} id="integration" className="relative py-32 pl-6 pr-6 md:pl-28 md:pr-12">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">04 / Integration</span>
        <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl tracking-tight md:text-7xl">
          ONE LINE TO SHIP
        </h2>
        <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          The trained assistant deploys as a single script tag or an iframe. Developers can install the open-source SDK
          instead.
        </p>
      </div>

      <div ref={cardRef} className="max-w-3xl border border-border/60 bg-card">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-border/60">
          <div className="flex">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "border-r border-border/60 px-4 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors",
                  active === t.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={copy}
            aria-label="Copy code"
            className="flex items-center gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Code */}
        <pre className="overflow-x-auto p-6 font-mono text-xs leading-relaxed text-foreground/90 scrollbar-thin">
          <code>{snippets[active]}</code>
        </pre>
      </div>
    </section>
  )
}
