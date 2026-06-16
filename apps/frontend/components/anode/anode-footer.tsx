"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AnodeFooter() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const columns = gridRef.current.querySelectorAll(":scope > div")
        gsap.from(columns, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 90%", toggleActions: "play none none reverse" },
        })
      }
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 97%", toggleActions: "play none none reverse" },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="colophon"
      className="relative border-t border-border/30 py-32 pl-6 pr-6 md:pl-28 md:pr-12"
    >
      <div ref={gridRef} className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
        <div className="col-span-2 md:col-span-1">
          <span className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-foreground">ANODE</span>
          <p className="mt-3 max-w-[200px] font-mono text-xs leading-relaxed text-muted-foreground">
            The AI assistant that lives inside any website.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Product</h4>
          <ul className="space-y-2">
            {["Modes", "Live Demo", "Training", "Pricing"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(" ", "")}`}
                  className="font-mono text-xs text-foreground/80 transition-colors duration-200 hover:text-accent"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Stack</h4>
          <ul className="space-y-2">
            {["Next.js", "Gemini", "AI SDK", "Vercel"].map((item) => (
              <li key={item} className="font-mono text-xs text-foreground/80">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a
                href="mailto:hello@anode.ai"
                className="font-mono text-xs text-foreground/80 transition-colors duration-200 hover:text-accent"
              >
                Email
              </a>
            </li>
            <li>
              <a
                href="#"
                className="font-mono text-xs text-foreground/80 transition-colors duration-200 hover:text-accent"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        ref={footerRef}
        className="mt-24 flex flex-col gap-4 border-t border-border/20 pt-8 md:flex-row md:items-center md:justify-between"
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          © 2026 Anode. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">Trained on your data. Styled to your brand.</p>
      </div>
    </section>
  )
}
