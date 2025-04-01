import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth-service"
import { checkTransactionStatus } from "@/lib/mpesa-service"

// Schema for validation
const statusSchema = z.object({
  transactionId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      )
    }

    const data = await request.json()

    // Validate request data
    const validationResult = statusSchema.safeParse(data)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.issues,
        },
        { status: 400 },
      )
    }

    const { transactionId } = validationResult.data

    // Check transaction status
    const statusResult = await checkTransactionStatus(transactionId)

    return NextResponse.json({
      success: statusResult.success,
      message: statusResult.message,
      transactionId: statusResult.transactionId,
    })
  } catch (error) {
    console.error("Transaction status check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while checking transaction status",
      },
      { status: 500 },
    )
  }
}

