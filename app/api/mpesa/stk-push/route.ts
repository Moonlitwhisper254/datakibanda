import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth-service"
import { initiateMpesaPayment } from "@/lib/mpesa-service"
import prisma from "@/lib/prisma"

// Schema for validation
const paymentSchema = z.object({
  phoneNumber: z.string(),
  amount: z.number().positive(),
  packageId: z.number().positive(),
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
    const validationResult = paymentSchema.safeParse(data)
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

    const { phoneNumber, amount, packageId } = validationResult.data

    // Verify that the package exists
    const dataPackage = await prisma.dataPackage.findUnique({
      where: { id: packageId },
    })

    if (!dataPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid package ID",
        },
        { status: 400 },
      )
    }

    // Initiate M-Pesa payment
    const paymentResult = await initiateMpesaPayment(phoneNumber, amount, currentUser.id, packageId)

    if (!paymentResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: paymentResult.message || "Failed to initiate payment",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Payment initiated successfully",
      transactionId: paymentResult.transactionId,
      responseDescription: paymentResult.responseDescription,
    })
  } catch (error) {
    console.error("M-Pesa STK Push error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing payment",
      },
      { status: 500 },
    )
  }
}

