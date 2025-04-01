import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // This is a mock implementation
    // In a real app, you would send a reset email

    // For demo purposes, just return success
    return NextResponse.json({
      success: true,
      message: "Reset code sent successfully",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}

