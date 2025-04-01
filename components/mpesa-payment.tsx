"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertCircle, Phone } from "lucide-react"
import { isValidPhoneNumber } from "@/lib/utils"

interface MpesaPaymentProps {
  amount: number
  packageId?: string
  packageName: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export default function MpesaPayment({ amount, packageId, packageName, onSuccess, onError }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [isPolling, setIsPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      setIsPolling(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidPhoneNumber(phoneNumber)) {
      setStatus("error")
      setMessage("Please enter a valid Kenyan phone number")
      return
    }

    try {
      setIsLoading(true)
      setStatus("loading")
      setMessage("Initiating M-Pesa payment...")

      const response = await fetch("/api/mpesa/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          amount,
          packageId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Payment initiation failed")
      }

      setStatus("success")
      setMessage("Payment request sent! Check your phone to complete the transaction.")
      setTransactionId(data.transactionId)

      // Start polling for transaction status
      pollTransactionStatus(data.transactionId)

      // Call onSuccess callback with transaction ID
      onSuccess?.(data.transactionId)
    } catch (error) {
      setStatus("error")
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      setMessage(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to poll transaction status
  const pollTransactionStatus = async (txId: string) => {
    setIsPolling(true)
    setPollCount(0)

    const maxAttempts = 12 // Poll for up to 2 minutes (12 * 10 seconds)
    const pollInterval = 10000 // 10 seconds between polls

    const poll = async () => {
      if (!isPolling) return

      try {
        const response = await fetch("/api/mpesa/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: txId }),
        })

        const data = await response.json()
        setPollCount((prev) => prev + 1)

        if (data.success) {
          // Transaction completed successfully
          setMessage("Payment completed successfully! Your bundle has been activated.")
          setIsPolling(false)
          return
        }

        if (data.status === "failed") {
          // Transaction failed
          setStatus("error")
          setMessage(`Payment failed: ${data.message}`)
          setIsPolling(false)
          onError?.(data.message)
          return
        }

        // Continue polling if still pending and under max attempts
        if (pollCount < maxAttempts) {
          setTimeout(poll, pollInterval)
        } else {
          // Stop polling after max attempts
          setIsPolling(false)
          setMessage("Payment status is still pending. You will receive an SMS when the payment is processed.")
        }
      } catch (error) {
        console.error("Error polling transaction status:", error)

        // Continue polling despite errors, if under max attempts
        if (pollCount < maxAttempts) {
          setTimeout(poll, pollInterval)
        } else {
          setIsPolling(false)
        }
      }
    }

    // Start polling
    poll()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">M-Pesa Payment</CardTitle>
        <CardDescription className="text-center">
          Pay Ksh {amount.toFixed(2)} for {packageName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="07XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                required
                disabled={status === "success" || isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your Safaricom, Airtel, or Telkom Kenya number</p>
          </div>

          {status === "error" && (
            <div className="flex items-center space-x-2 text-destructive text-sm p-2 bg-destructive/10 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center space-x-2 text-primary text-sm p-2 bg-primary/10 rounded">
              <CheckCircle className="w-4 h-4" />
              <span>{message}</span>

              {isPolling && (
                <div className="ml-auto">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#4CAF50] hover:bg-[#45a049]"
            disabled={isLoading || status === "success"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : status === "success" ? (
              "Payment Initiated"
            ) : (
              "Pay with M-Pesa"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-xs text-center text-muted-foreground">
          You will receive an STK push notification on your phone. Enter your M-Pesa PIN to complete the transaction.
        </p>
      </CardFooter>
    </Card>
  )
}

