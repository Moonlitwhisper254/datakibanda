import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionId)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

