import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/db"

export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (sessionId) {
      // Revoke session in database
      await prisma.authSession.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      })

      // Delete cookie
      cookies().delete("session_id")
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
  }
}

