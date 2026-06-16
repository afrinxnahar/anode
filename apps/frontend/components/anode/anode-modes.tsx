"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MODE_LIST } from "@/lib/anode-data"
import { Globe, Lock, Terminal } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const icons = {
  public: Globe,
  private: Lock,
  dev: Terminal,
}

const access: Record<string, string> = {
  public: "Visible on every public page",
  private: "Dashboard-only, private context",
  dev: "Open-source, bring your own key",
}

export function AnodeModes() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="modes" className="relative py-32 pl-6 pr-6 md:pl-28 md:pr-12">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Modes</span>
        <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl tracking-tight md:text-7xl">
          THREE WAYS TO DEPLOY
        </h2>
        <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          One engine, three contexts. Each mode is isolated by data, audience, and access.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {MODE_LIST.map((mode) => {
          const Icon = icons[mode.id]
          return (
            <article
              key={mode.id}
              className="group relative flex flex-col border border-border/40 p-6 transition-colors duration-500 hover:border-accent/60"
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative z-10 flex items-center justify-between">
                <Icon className="h-5 w-5 text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                  {mode.index}
                </span>
              </div>

              <h3
                className={cn(
                  "relative z-10 mt-6 font-[family-name:var(--font-bebas)] text-4xl tracking-tight transition-colors duration-300 group-hover:text-accent",
                )}
              >
                {mode.label} Mode
              </h3>

              <p className="relative z-10 mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {mode.tagline}
              </p>

              <div className="relative z-10 my-5 h-px w-12 bg-accent/60 transition-all duration-500 group-hover:w-full" />

              <p className="relative z-10 font-mono text-xs leading-relaxed text-muted-foreground">
                {mode.description}
              </p>

              <p className="relative z-10 mt-6 border-t border-border/40 pt-4 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
                {access[mode.id]}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
