"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Copy, CheckCircle, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Sample referral data
const referrals = [
  { id: 1, name: "John Doe", phone: "07XXXXXXXX", date: "2023-12-15", status: "active", earnings: 20 },
  { id: 2, name: "Jane Smith", phone: "07XXXXXXXX", date: "2023-12-10", status: "active", earnings: 20 },
  { id: 3, name: "Mike Johnson", phone: "07XXXXXXXX", date: "2023-12-05", status: "active", earnings: 20 },
  { id: 4, name: "Sarah Williams", phone: "07XXXXXXXX", date: "2023-11-28", status: "active", earnings: 20 },
  { id: 5, name: "David Brown", phone: "07XXXXXXXX", date: "2023-11-20", status: "active", earnings: 20 },
  { id: 6, name: "Emily Davis", phone: "07XXXXXXXX", date: "2023-11-15", status: "active", earnings: 20 },
  { id: 7, name: "Robert Wilson", phone: "07XXXXXXXX", date: "2023-11-10", status: "active", earnings: 20 },
  { id: 8, name: "Lisa Taylor", phone: "07XXXXXXXX", date: "2023-11-05", status: "active", earnings: 20 },
  { id: 9, name: "Michael Anderson", phone: "07XXXXXXXX", date: "2023-10-28", status: "active", earnings: 20 },
  { id: 10, name: "Jennifer Thomas", phone: "07XXXXXXXX", date: "2023-10-20", status: "active", earnings: 20 },
  { id: 11, name: "James Jackson", phone: "07XXXXXXXX", date: "2023-10-15", status: "active", earnings: 20 },
  { id: 12, name: "Amanda White", phone: "07XXXXXXXX", date: "2023-10-10", status: "active", earnings: 20 },
]

// Sample withdrawal history
const withdrawals = [
  { id: 1, amount: 1000, date: "2023-11-15", status: "completed", method: "M-Pesa" },
  { id: 2, amount: 1000, date: "2023-09-20", status: "completed", method: "M-Pesa" },
  { id: 3, amount: 1000, date: "2023-07-05", status: "completed", method: "M-Pesa" },
]

export default function ReferralsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(1000)
  const [withdrawPhone, setWithdrawPhone] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Sample referral data
  const referralCode = "DS" + Math.random().toString(36).substring(2, 8).toUpperCase()
  const referralLink = `https://datasoko.com/register?ref=${referralCode}`
  const totalEarnings = referrals.reduce((sum, ref) => sum + ref.earnings, 0)
  const withdrawalThreshold = 1000
  const canWithdraw = totalEarnings >= withdrawalThreshold

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast({
      title: "Copied to clipboard!",
      description: "Referral link has been copied to your clipboard.",
    })
    setTimeout(() => setCopied(false), 3000)
  }

  const handleWithdraw = () => {
    setIsWithdrawing(true)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Withdrawal Initiated!",
        description: `Ksh ${withdrawAmount} will be sent to your M-Pesa account shortly.`,
      })
      setIsWithdrawing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground">Invite friends and earn Ksh 20 for each successful referral</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={referralLink} readOnly />
              <Button size="icon" onClick={copyToClipboard}>
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">Your Referral Code:</div>
              <div className="bg-muted px-2 py-1 rounded text-sm font-mono">{referralCode}</div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <div className="text-sm text-muted-foreground">
              When someone signs up using your link, you'll earn Ksh 20 once they make their first purchase.
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Users className="h-4 w-4" />
                <span>Share via WhatsApp</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Users className="h-4 w-4" />
                <span>Share via SMS</span>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
            <CardDescription>Track your referral earnings and withdrawals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
                <div className="text-2xl font-bold">Ksh {totalEarnings}</div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {referrals.length} Referrals
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next withdrawal</span>
                <span>
                  Ksh {totalEarnings} / Ksh {withdrawalThreshold}
                </span>
              </div>
              <Progress value={(totalEarnings / withdrawalThreshold) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                You need Ksh {withdrawalThreshold} to withdraw your earnings
              </p>
            </div>

            <div className="pt-2">
              <Button
                className="w-full"
                disabled={!canWithdraw}
                onClick={() => document.getElementById("withdraw-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                {canWithdraw ? "Withdraw Earnings" : `Need Ksh ${withdrawalThreshold - totalEarnings} more to withdraw`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Your Referrals</TabsTrigger>
          <TabsTrigger value="withdraw" id="withdraw-section">
            Withdraw Earnings
          </TabsTrigger>
          <TabsTrigger value="history">Withdrawal History</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral List</CardTitle>
              <CardDescription>People who signed up using your referral link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                  <div>Name</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div className="text-right">Earnings</div>
                </div>
                <div className="divide-y">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                      <div>{referral.name}</div>
                      <div className="text-sm text-muted-foreground">{referral.date}</div>
                      <div>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Active
                        </span>
                      </div>
                      <div className="text-right font-medium">Ksh {referral.earnings}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Earnings</CardTitle>
              <CardDescription>Withdraw your earnings to M-Pesa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Ksh)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  min={1000}
                  max={totalEarnings}
                  step={100}
                  disabled={!canWithdraw}
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal amount is Ksh 1,000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="07XXXXXXXX"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  disabled={!canWithdraw}
                />
              </div>

              <Button
                className="w-full"
                disabled={!canWithdraw || isWithdrawing || !withdrawPhone}
                onClick={handleWithdraw}
              >
                {isWithdrawing ? "Processing..." : "Withdraw to M-Pesa"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>Your past withdrawal transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Method</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                        <div className="text-sm">{withdrawal.date}</div>
                        <div className="font-medium">Ksh {withdrawal.amount}</div>
                        <div>{withdrawal.method}</div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No withdrawal history yet</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

