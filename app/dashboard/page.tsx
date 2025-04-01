"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BarChart3, CreditCard, Phone, Users } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "User"}! Buy data bundles for your favorite networks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh 4,550</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bundles</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 expiring soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh 240</div>
            <p className="text-xs text-muted-foreground">12 successful referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2 GB</div>
            <p className="text-xs text-muted-foreground">Used this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Choose a network to buy data bundles</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button
              className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/dashboard/safaricom")}
            >
              <Phone className="h-8 w-8" />
              <span>Safaricom</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
              onClick={() => router.push("/dashboard/airtel")}
            >
              <Phone className="h-8 w-8" />
              <span>Airtel</span>
            </Button>
            <Button
              className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/dashboard/telkom")}
            >
              <Phone className="h-8 w-8" />
              <span>Telkom</span>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest data purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">1GB Daily Bundle</p>
                <p className="text-xs text-muted-foreground">Safaricom • 2 days ago</p>
              </div>
              <div className="text-sm font-medium">Ksh 99</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">YouTube Bundle</p>
                <p className="text-xs text-muted-foreground">Airtel • 5 days ago</p>
              </div>
              <div className="text-sm font-medium">Ksh 150</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">5GB Monthly Bundle</p>
                <p className="text-xs text-muted-foreground">Safaricom • 2 weeks ago</p>
              </div>
              <div className="text-sm font-medium">Ksh 500</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

