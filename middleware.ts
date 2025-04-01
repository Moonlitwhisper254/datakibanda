import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
})

// Rate limiter for payment endpoints
const paymentLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Max 100 payment requests per minute
})

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Apply rate limiting for auth endpoints
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const ip = request.ip ?? "anonymous"

    try {
      await authLimiter.check(response, 10, ip) // 10 requests per minute per IP
    } catch {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  }

  // Apply rate limiting for payment endpoints
  if (request.nextUrl.pathname.startsWith("/api/mpesa")) {
    const ip = request.ip ?? "anonymous"

    try {
      await paymentLimiter.check(response, 5, ip) // 5 payment requests per minute per IP
    } catch {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  }

  return response
}

export const config = {
  matcher: ["/api/:path*"],
}

