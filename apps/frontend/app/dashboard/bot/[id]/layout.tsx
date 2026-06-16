import type { ReactNode } from "react"
import { BotTabs } from "@/components/dashboard/bot-tabs"

export default function BotLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <BotTabs />
      {children}
    </div>
  )
}
