import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
          filter: "brightness(0.7)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-16 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">DataSoko</h1>
        <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md">Kenya's Premium Data Bundle Marketplace</p>
        <p className="text-lg md:text-xl text-white mb-12 drop-shadow-md">
          Fast, Affordable Data Bundles for Safaricom, Airtel & Telkom Kenya
        </p>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-full animate-pulse"
        >
          <Link href="/dashboard">GET STARTED</Link>
        </Button>
      </div>
    </div>
  )
}

