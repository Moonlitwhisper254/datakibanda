"use client"

import { useState } from "react"
import MpesaPayment from "@/components/mpesa-payment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle } from "lucide-react"

export default function PurchasePage() {
  const [transactionStatus, setTransactionStatus] = useState<{
    success: boolean
    transactionId?: string
  } | null>(null)

  const handlePaymentSuccess = (transactionId: string) => {
    setTransactionStatus({
      success: true,
      transactionId,
    })

    // You might want to poll for the transaction status here
    // or redirect to a confirmation page
  }

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    setTransactionStatus({
      success: false,
    })
  }

  // Sample data bundle
  const dataBundle = {
    name: "Daily 1GB Bundle",
    amount: 99,
    provider: "Safaricom",
    validity: "24 hours",
    description: "High-speed internet for 24 hours with 1GB data limit",
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Complete Your Purchase</h1>

      {transactionStatus?.success ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center">Payment Initiated!</CardTitle>
            <CardDescription className="text-center">Check your phone to complete the M-Pesa payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Transaction Reference:</p>
                <p className="text-sm">{transactionStatus.transactionId}</p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Once payment is complete, your data bundle will be activated automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Details</CardTitle>
              <CardDescription>Review your selected data bundle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Bundle:</span>
                  <span>{dataBundle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Provider:</span>
                  <span className="text-green-600 font-medium">{dataBundle.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Validity:</span>
                  <span>{dataBundle.validity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="text-lg font-bold">Ksh {dataBundle.amount}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{dataBundle.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Tabs defaultValue="mpesa">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
                <TabsTrigger value="card">Card</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
              </TabsList>
              <TabsContent value="mpesa">
                <MpesaPayment
                  amount={dataBundle.amount}
                  packageName={dataBundle.name}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </TabsContent>
              <TabsContent value="card">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Payment</CardTitle>
                    <CardDescription>Coming soon</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="paypal">
                <Card>
                  <CardHeader>
                    <CardTitle>PayPal</CardTitle>
                    <CardDescription>Coming soon</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}

