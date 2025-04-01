"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password === confirmPassword

  // Phone number validation and provider detection
  const validatePhoneNumber = (phone: string) => {
    const safaricomRegex = /^(07[0-9]|01[0-9])[0-9]{7}$/
    const airtelRegex = /^(073|074|075)[0-9]{7}$/
    const telkomRegex = /^(077)[0-9]{7}$/

    if (safaricomRegex.test(phone)) {
      setProvider("Safaricom")
      return true
    } else if (airtelRegex.test(phone)) {
      setProvider("Airtel")
      return true
    } else if (telkomRegex.test(phone)) {
      setProvider("Telkom")
      return true
    } else {
      setProvider(null)
      return false
    }
  }

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate phone
    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid Kenyan phone number")
      return
    }

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    // Validate password
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasSpecialChar) {
      setError("Password does not meet the requirements")
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const success = await register({
        phone,
        email,
        password,
        referralCode: referralCode || undefined,
      })

      if (success) {
        router.push("/auth/login?registered=true")
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to create your DataSoko account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  validatePhoneNumber(e.target.value)
                }}
                required
              />
              {provider && (
                <p className="text-sm text-muted-foreground mt-1">
                  Detected provider: <span className="font-medium">{provider}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center text-sm">
                  {hasMinLength ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center text-sm">
                  {hasUppercase ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span>Uppercase letter</span>
                </div>
                <div className="flex items-center text-sm">
                  {hasLowercase ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span>Lowercase letter</span>
                </div>
                <div className="flex items-center text-sm">
                  {hasSpecialChar ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span>Special character</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <div className="flex items-center text-sm mt-1">
                  {passwordsMatch ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 mr-2 text-red-500" />
                  )}
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

