"use client"

import { useEffect, useRef } from "react"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { SplitFlapText, SplitFlapMuteToggle, SplitFlapAudioProvider } from "@/components/split-flap-text"
import { AnimatedNoise } from "@/components/animated-noise"
import { BitmapChevron } from "@/components/bitmap-chevron"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function AnodeHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -100,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-screen items-center pl-6 pr-6 md:pl-28 md:pr-12"
    >
      <AnimatedNoise opacity={0.03} />

      {/* Left vertical label */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 md:left-6">
        <span className="block origin-left -rotate-90 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          ANODE / AI ASSISTANT
        </span>
      </div>

      <div ref={contentRef} className="w-full flex-1">
        <SplitFlapAudioProvider>
          <div className="relative">
            <SplitFlapText text="ANODE" speed={80} />
            <div className="mt-4">
              <SplitFlapMuteToggle />
            </div>
          </div>
        </SplitFlapAudioProvider>

        <h2 className="mt-4 font-[family-name:var(--font-bebas)] text-[clamp(1rem,3vw,2rem)] tracking-wide text-muted-foreground/60">
          The Assistant That Lives Inside Any Website
        </h2>

        <p className="mt-12 max-w-lg font-mono text-sm leading-relaxed text-muted-foreground">
          An LLM-powered chatbot in three modes — public, private, and dev. Train it on your data, let it adopt your
          design, and ship it with a single script tag.
        </p>

        <div className="mt-16 flex flex-wrap items-center gap-8">
          <a
            href="/dashboard"
            className="group inline-flex items-center gap-3 bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-accent-foreground transition-all duration-200 hover:opacity-90"
          >
            <ScrambleTextOnHover text="Open Dashboard" as="span" duration={0.6} />
            <BitmapChevron className="transition-transform duration-[400ms] ease-in-out group-hover:rotate-45" />
          </a>
          <a
            href="#demo"
            className="group inline-flex items-center gap-3 border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
          >
            <ScrambleTextOnHover text="Try The Demo" as="span" duration={0.6} />
          </a>
        </div>
      </div>

      {/* Floating tag */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
        <div className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          v.01 / Powered by Gemini
        </div>
      </div>
    </section>
  )
}
