import { NextResponse } from "next/server"
import { handleCallback } from "@/lib/mpesa"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await handleCallback(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    // Always return success to M-Pesa to prevent retries
    return NextResponse.json({ success: true })
  }
}

