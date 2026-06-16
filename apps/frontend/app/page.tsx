import { AnodeNav } from "@/components/anode/anode-nav"
import { AnodeHero } from "@/components/anode/anode-hero"
import { AnodeModes } from "@/components/anode/anode-modes"
import { AnodeDemo } from "@/components/anode/anode-demo"
import { AnodeTraining } from "@/components/anode/anode-training"
import { AnodeIntegration } from "@/components/anode/anode-integration"
import { AnodePricing } from "@/components/anode/anode-pricing"
import { AnodeFooter } from "@/components/anode/anode-footer"
import { AnodeLauncher } from "@/components/anode/anode-launcher"

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <AnodeNav />
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      <div className="relative z-10">
        <AnodeHero />
        <AnodeModes />
        <AnodeDemo />
        <AnodeTraining />
        <AnodeIntegration />
        <AnodePricing />
        <AnodeFooter />
      </div>

      {/* Always-on public-mode popup, like the shipped Anode bot */}
      <AnodeLauncher />
    </main>
  )
}
