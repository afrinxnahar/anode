"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { BitmapChevron } from "@/components/bitmap-chevron"
import { Check } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: "Dev",
    price: "Free",
    note: "Open source",
    description: "The full SDK / npm package. Bring your own model key and ship support yourself.",
    features: ["MIT licensed", "Bring your own API key", "Docs-site mode", "Full theming control", "No account needed"],
    cta: "View on GitHub",
    featured: false,
  },
  {
    name: "Public",
    price: "One-time",
    note: "Managed setup",
    description: "Customer-facing pop-up trained on your public data. We set it up end to end.",
    features: [
      "Trained on your public data",
      "Auto-matched to your design",
      "Single script tag or iframe",
      "Handles customer queries",
      "One-time setup, no subscription",
    ],
    cta: "Request Setup",
    featured: true,
  },
  {
    name: "Private",
    price: "One-time",
    note: "Secure install",
    description: "Internal dashboard assistant with private context. Configured by our team, securely.",
    features: [
      "Private internal context",
      "Guides users + basic tasks",
      "Configured without data exposure",
      "Dashboard-only visibility",
      "One-time setup, no subscription",
    ],
    cta: "Request Setup",
    featured: false,
  },
]

export function AnodePricing() {
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
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 88%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="pricing" className="relative py-32 pl-6 pr-6 md:pl-28 md:pr-12">
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Pricing</span>
        <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-5xl tracking-tight md:text-7xl">
          NO SUBSCRIPTIONS
        </h2>
        <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          The Dev SDK is free forever. Public and Private modes are a one-time setup, fully managed by our team.
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "group relative flex flex-col border p-6 transition-colors duration-300",
              plan.featured ? "border-accent bg-accent/5" : "border-border/40 hover:border-accent/60",
            )}
          >
            {plan.featured && (
              <span className="absolute -top-px right-0 bg-accent px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-accent-foreground">
                Most Popular
              </span>
            )}

            <div className="flex items-baseline justify-between">
              <h3 className="font-[family-name:var(--font-bebas)] text-3xl tracking-tight">{plan.name}</h3>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{plan.note}</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-bebas)] text-5xl tracking-tight text-accent">
                {plan.price}
              </span>
            </div>

            <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">{plan.description}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 font-mono text-xs text-foreground/80">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#demo"
              className={cn(
                "group/btn mt-8 inline-flex items-center justify-between border px-5 py-3 font-mono text-xs uppercase tracking-widest transition-all duration-200",
                plan.featured
                  ? "border-accent bg-accent text-accent-foreground hover:bg-transparent hover:text-accent"
                  : "border-foreground/20 text-foreground hover:border-accent hover:text-accent",
              )}
            >
              <ScrambleTextOnHover text={plan.cta} as="span" duration={0.5} />
              <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover/btn:rotate-45" />
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
