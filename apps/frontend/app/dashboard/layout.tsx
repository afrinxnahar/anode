import type { ReactNode } from "react"
import { AnodeStoreProvider } from "@/lib/anode-store"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AnodeStoreProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 md:pl-[220px]">{children}</main>
      </div>
    </AnodeStoreProvider>
  )
}
