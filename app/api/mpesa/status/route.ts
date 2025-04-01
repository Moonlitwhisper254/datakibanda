import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { checkTransactionStatus } from "@/lib/mpesa"

const schema = z.object({
  transactionId: z.string().min(1),
})

export async function POST(request: Request) {
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

    const body = await request.json()
    const data = schema.parse(body)

    const result = await checkTransactionStatus(data.transactionId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Transaction status check error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while checking transaction status" },
      { status: 500 },
    )
  }
}

