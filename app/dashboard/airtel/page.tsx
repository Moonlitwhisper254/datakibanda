"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Youtube, TwitterIcon as TikTok, Play } from "lucide-react"
import MpesaPayment from "@/components/mpesa-payment"

// Data package types
type DataPackage = {
  id: string
  name: string
  data: string
  validity: string
  price: number
  description?: string
}

// Sample data packages
const dailyPackages: DataPackage[] = [
  {
    id: "daily-1",
    name: "Daily Lite",
    data: "50MB",
    validity: "24 hours",
    price: 10,
    description: "Perfect for light browsing and messaging",
  },
  {
    id: "daily-2",
    name: "Daily Basic",
    data: "150MB",
    validity: "24 hours",
    price: 20,
    description: "Great for social media and light streaming",
  },
  {
    id: "daily-3",
    name: "Daily Plus",
    data: "500MB",
    validity: "24 hours",
    price: 50,
    description: "Ideal for video calls and streaming",
  },
  {
    id: "daily-4",
    name: "Daily Premium",
    data: "1.5GB",
    validity: "24 hours",
    price: 99,
    description: "High-speed data for all your daily needs",
  },
  {
    id: "daily-5",
    name: "Daily Unlimited",
    data: "5GB",
    validity: "24 hours",
    price: 150,
    description: "Maximum data for heavy users",
  },
]

const weeklyPackages: DataPackage[] = [
  {
    id: "weekly-1",
    name: "Weekly Lite",
    data: "700MB",
    validity: "7 days",
    price: 100,
    description: "Budget-friendly weekly data",
  },
  {
    id: "weekly-2",
    name: "Weekly Basic",
    data: "2GB",
    validity: "7 days",
    price: 200,
    description: "Balanced data for a full week",
  },
  {
    id: "weekly-3",
    name: "Weekly Plus",
    data: "4GB",
    validity: "7 days",
    price: 300,
    description: "Generous data for a week of streaming",
  },
  {
    id: "weekly-4",
    name: "Weekly Premium",
    data: "10GB",
    validity: "7 days",
    price: 500,
    description: "Full week of high-speed data",
  },
  {
    id: "weekly-5",
    name: "Weekly Unlimited",
    data: "20GB",
    validity: "7 days",
    price: 1000,
    description: "Maximum weekly data for power users",
  },
]

const monthlyPackages: DataPackage[] = [
  {
    id: "monthly-1",
    name: "Monthly Lite",
    data: "3GB",
    validity: "30 days",
    price: 300,
    description: "Basic monthly data for light users",
  },
  {
    id: "monthly-2",
    name: "Monthly Basic",
    data: "8GB",
    validity: "30 days",
    price: 500,
    description: "Standard monthly data package",
  },
  {
    id: "monthly-3",
    name: "Monthly Plus",
    data: "15GB",
    validity: "30 days",
    price: 1000,
    description: "Enhanced monthly data for regular streaming",
  },
  {
    id: "monthly-4",
    name: "Monthly Premium",
    data: "30GB",
    validity: "30 days",
    price: 2000,
    description: "Premium monthly data for heavy users",
  },
  {
    id: "monthly-5",
    name: "Monthly Unlimited",
    data: "60GB",
    validity: "30 days",
    price: 3000,
    description: "Maximum monthly data for power users",
  },
]

const youtubePackages: DataPackage[] = [
  {
    id: "youtube-1",
    name: "YouTube Lite",
    data: "1.5GB",
    validity: "24 hours",
    price: 50,
    description: "1 day of YouTube streaming",
  },
  {
    id: "youtube-2",
    name: "YouTube Basic",
    data: "5GB",
    validity: "7 days",
    price: 250,
    description: "1 week of YouTube streaming",
  },
  {
    id: "youtube-3",
    name: "YouTube Premium",
    data: "15GB",
    validity: "30 days",
    price: 1000,
    description: "1 month of YouTube streaming",
  },
]

const tiktokPackages: DataPackage[] = [
  {
    id: "tiktok-1",
    name: "TikTok Lite",
    data: "1.5GB",
    validity: "24 hours",
    price: 50,
    description: "1 day of TikTok browsing",
  },
  {
    id: "tiktok-2",
    name: "TikTok Basic",
    data: "5GB",
    validity: "7 days",
    price: 250,
    description: "1 week of TikTok browsing",
  },
  {
    id: "tiktok-3",
    name: "TikTok Premium",
    data: "15GB",
    validity: "30 days",
    price: 1000,
    description: "1 month of TikTok browsing",
  },
]

const showmaxPackages: DataPackage[] = [
  {
    id: "showmax-1",
    name: "Showmax Lite",
    data: "3GB",
    validity: "24 hours",
    price: 100,
    description: "1 day of Showmax streaming",
  },
  {
    id: "showmax-2",
    name: "Showmax Basic",
    data: "8GB",
    validity: "7 days",
    price: 500,
    description: "1 week of Showmax streaming",
  },
  {
    id: "showmax-3",
    name: "Showmax Premium",
    data: "20GB",
    validity: "30 days",
    price: 1500,
    description: "1 month of Showmax streaming",
  },
]

export default function AirtelPage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<DataPackage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSelf, setIsSelf] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [showPayment, setShowPayment] = useState(false)

  const handlePackageSelect = (pkg: DataPackage) => {
    setSelectedPackage(pkg)
    setIsDialogOpen(true)
  }

  const handleProceedToPayment = () => {
    setShowPayment(true)
  }

  const handlePaymentSuccess = (transactionId: string) => {
    // Handle successful payment
    setIsDialogOpen(false)
    setShowPayment(false)
    // Show success notification or redirect
  }

  return (
    <div
      className="space-y-6 relative"
      style={{
        backgroundImage: "url('/images/airtel-watermark.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundBlendMode: "overlay",
        backgroundOpacity: "0.1",
      }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-600">Airtel Bundles</h1>
        <p className="text-muted-foreground">Choose from a variety of Airtel data bundles</p>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <TabsTrigger value="daily">Daily Data</TabsTrigger>
          <TabsTrigger value="weekly">7 Days</TabsTrigger>
          <TabsTrigger value="monthly">30 Days</TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            <span>YouTube</span>
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2">
            <TikTok className="h-4 w-4" />
            <span>TikTok</span>
          </TabsTrigger>
          <TabsTrigger value="showmax" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>Showmax</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dailyPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{pkg.data}</p>
                      <p className="text-sm text-muted-foreground">Valid for {pkg.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Ksh {pkg.price}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weeklyPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{pkg.data}</p>
                      <p className="text-sm text-muted-foreground">Valid for {pkg.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Ksh {pkg.price}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {monthlyPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{pkg.data}</p>
                      <p className="text-sm text-muted-foreground">Valid for {pkg.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Ksh {pkg.price}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {youtubePackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{pkg.data}</p>
                      <p className="text-sm text-muted-foreground">Valid for {pkg.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Ksh {pkg.price}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiktok" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiktokPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <TikTok className="h-5 w-5" />
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{pkg.data}</p>
                      <p className="text-sm text-muted-foreground">Valid for {pkg.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Ksh {pkg.price}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="showmax" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showmaxPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="cursor-pointer hover:border-red-500 transition-colors"
                onClick={() => handlePackageSelect(pkg)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-purple-600" />
                    {pkg.name}
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{pkg.data}</p>
                      <p className="text-sm text-muted-foreground">Valid for {pkg.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Ksh {pkg.price}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedPackage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Purchase {selectedPackage.name}</DialogTitle>
              <DialogDescription>
                {selectedPackage.data} valid for {selectedPackage.validity} at Ksh {selectedPackage.price}
              </DialogDescription>
            </DialogHeader>

            {!showPayment ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Purchase for</Label>
                  <RadioGroup defaultValue="self" onValueChange={(value) => setIsSelf(value === "self")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="self" id="self" />
                      <Label htmlFor="self">Myself</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Someone else</Label>
                    </div>
                  </RadioGroup>
                </div>

                {!isSelf && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="07XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup defaultValue="mpesa" onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa">M-Pesa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Card Payment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleProceedToPayment}>Proceed to Payment</Button>
                </div>
              </div>
            ) : (
              <div>
                {paymentMethod === "mpesa" && (
                  <MpesaPayment
                    amount={selectedPackage.price}
                    packageName={selectedPackage.name}
                    onSuccess={handlePaymentSuccess}
                    onError={() => {}}
                  />
                )}
                {paymentMethod === "card" && (
                  <div className="text-center py-4">
                    <p>Card payment integration coming soon</p>
                    <Button variant="outline" onClick={() => setShowPayment(false)} className="mt-4">
                      Back
                    </Button>
                  </div>
                )}
                {paymentMethod === "paypal" && (
                  <div className="text-center py-4">
                    <p>PayPal integration coming soon</p>
                    <Button variant="outline" onClick={() => setShowPayment(false)} className="mt-4">
                      Back
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

