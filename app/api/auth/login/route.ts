import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { authenticateUser, createSession } from "@/lib/auth"
import logger from "@/lib/logger"

const schema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request data
    try {
      schema.parse(body)
    } catch (error) {
      logger.warn("Login validation failed", { error: error.message })
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 })
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const { user, error } = await authenticateUser(body.identifier, body.password, ipAddress, userAgent)

    if (error || !user) {
      return NextResponse.json({ success: false, message: error || "Authentication failed" }, { status: 401 })
    }

    // Create session
    const sessionId = await createSession(user.id, ipAddress, userAgent)

    // Set session cookie
    cookies().set({
      name: "session_id",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "strict",
    })

    logger.info(`User ${user.id} logged in successfully`)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user,
    })
  } catch (error) {
    logger.error(`Login error: ${error.message}`)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}

