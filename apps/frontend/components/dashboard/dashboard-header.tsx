import type { ReactNode } from "react"

interface DashboardHeaderProps {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}

export function DashboardHeader({ eyebrow, title, description, actions }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-6 md:flex-row md:items-end md:justify-between md:px-10 md:py-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{eyebrow}</span>
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl leading-none tracking-wide text-foreground md:text-5xl">
          {title}
        </h1>
        {description && <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  )
}
