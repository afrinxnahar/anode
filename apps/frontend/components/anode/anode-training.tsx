"use client"

import { useRef, useEffect } from "react"
import { HighlightText } from "@/components/highlight-text"
import { Link2, Upload, Palette, KeyRound } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Paste a URL",
    body: "Drop in your website address. Anode scrapes pages, links, and references to learn what your product does.",
  },
  {
    icon: Upload,
    number: "02",
    title: "Upload any format",
    body: "PDF, Markdown, CSV, JSON, HTML, or plain text. If it holds knowledge, Anode can ingest it.",
  },
  {
    icon: Palette,
    number: "03",
    title: "Auto-styled",
    body: "From your site details, Anode designs the assistant to match — fonts, colors, and radius detected on scrape.",
  },
  {
    icon: KeyRound,
    number: "04",
    title: "Your model, optional",
    body: "Use the internal Anode model, or plug in your own provider key. Training still saves your context either way.",
  },
]

export function AnodeTraining() {
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
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="training" className="relative py-32 pl-6 pr-6 md:pl-28 md:pr-12">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Training</span>
        <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-tight md:text-7xl">
          TRAIN IT ON{" "}
          <HighlightText parallaxSpeed={0.6}>ANYTHING</HighlightText>
        </h2>
        <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          No data wrangling. Point Anode at your content and it builds a knowledge base, then designs itself to fit your
          brand.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <article
              key={step.number}
              className="group flex flex-col border border-border/40 p-6 transition-colors duration-300 hover:border-accent/60"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-accent" />
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground/40">{step.number}</span>
              </div>
              <h3 className="mt-6 font-[family-name:var(--font-bebas)] text-2xl tracking-tight transition-colors duration-300 group-hover:text-accent">
                {step.title}
              </h3>
              <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
