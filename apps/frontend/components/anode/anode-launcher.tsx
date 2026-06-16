"use client"

import { useState } from "react"
import { MessageSquare, X } from "lucide-react"
import { AnodeWidget } from "@/components/anode/anode-widget"
import { cn } from "@/lib/utils"

/**
 * The floating Public-mode launcher that sits on every public page,
 * mirroring how the shipped Anode bot behaves on a customer site.
 */
export function AnodeLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="anode-pop origin-bottom-right">
          <AnodeWidget mode="public" onClose={() => setOpen(false)} />
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Anode assistant" : "Open Anode assistant"}
        aria-expanded={open}
        className={cn(
          "group flex h-12 w-12 items-center justify-center border border-border/60 transition-colors",
          open ? "bg-card text-foreground hover:border-accent" : "bg-accent text-accent-foreground",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </button>
    </div>
  )
}
