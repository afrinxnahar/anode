"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { MODE_LIST, type AnodeMode } from "@/lib/anode-data"
import { AnodeWidget } from "@/components/anode/anode-widget"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Each demo mode mounts inside a mock chrome that hints at its real context.
const frames: Record<AnodeMode, { url: string; label: string }> = {
  public: { url: "acme.com", label: "Public marketing site" },
  private: { url: "app.acme.com/dashboard", label: "Internal dashboard" },
  dev: { url: "docs.acme.com", label: "Documentation site" },
}

export function AnodeDemo() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<AnodeMode>("public")

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
      if (stageRef.current) {
        gsap.from(stageRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: stageRef.current, start: "top 90%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const frame = frames[mode]

  return (
    <section ref={sectionRef} id="demo" className="relative py-32 pl-6 pr-6 md:pl-28 md:pr-12">
      <div ref={headerRef} className="mb-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Live Demo</span>
        <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl tracking-tight md:text-7xl">
          TALK TO ANODE
        </h2>
        <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          Switch modes and ask real questions. Each mode answers only from its own isolated knowledge base — powered by
          Gemini.
        </p>
      </div>

      {/* Mode switcher */}
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Demo modes">
        {MODE_LIST.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex items-center gap-2 border px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
              mode === m.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border/60 text-muted-foreground hover:border-accent hover:text-foreground",
            )}
          >
            <span className="opacity-60">{m.index}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div ref={stageRef} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Mock site chrome with embedded widget */}
        <div className="order-2 flex flex-col border border-border/60 bg-card lg:order-1">
          {/* Browser bar */}
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
              <span className="h-2.5 w-2.5 rounded-full bg-muted" />
            </div>
            <div className="flex-1 truncate border border-border/40 bg-background px-3 py-1 font-mono text-[10px] text-muted-foreground">
              {frame.url}
            </div>
          </div>
          {/* Faux page body */}
          <div className="relative flex-1 overflow-hidden p-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">
              {frame.label}
            </span>
            <div className="mt-4 space-y-3" aria-hidden="true">
              <div className="h-6 w-2/3 bg-muted/40" />
              <div className="h-3 w-full bg-muted/20" />
              <div className="h-3 w-5/6 bg-muted/20" />
              <div className="h-3 w-3/4 bg-muted/20" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="h-20 border border-border/40 bg-muted/10" />
                <div className="h-20 border border-border/40 bg-muted/10" />
              </div>
            </div>
            <p className="mt-6 max-w-xs font-mono text-[10px] leading-relaxed text-muted-foreground">
              This is a stand-in host page. In production, Anode renders here exactly as configured for the site.
            </p>
          </div>
        </div>

        {/* Live widget — re-keyed per mode so state resets cleanly */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-start">
          <AnodeWidget key={mode} mode={mode} inline className="h-[560px] w-full max-w-[420px]" />
        </div>
      </div>
    </section>
  )
}
