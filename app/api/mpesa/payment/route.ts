import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { initiateSTKPush } from "@/lib/mpesa"
import prisma from "@/lib/db"
import logger from "@/lib/logger"
import { isValidPhoneNumber } from "@/lib/utils"

const schema = z.object({
  phone: z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Invalid phone number format",
  }),
  amount: z.number().positive("Amount must be positive"),
  packageId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      logger.warn("Unauthorized payment attempt: No session")
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getCurrentUser(sessionId)

    if (!user) {
      logger.warn("Unauthorized payment attempt: Invalid session")
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()

    // Validate request data
    try {
      schema.parse(body)
    } catch (error) {
      logger.warn("Payment validation failed", { userId: user.id, error: error.message })
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 })
    }

    // If packageId is provided, verify it exists
    if (body.packageId) {
      const dataPackage = await prisma.dataPackage.findUnique({
        where: { id: body.packageId },
      })

      if (!dataPackage) {
        logger.warn(`Invalid package ID: ${body.packageId}`, { userId: user.id })
        return NextResponse.json({ success: false, message: "Invalid package ID" }, { status: 400 })
      }

      logger.info(`Payment for package: ${dataPackage.name}`, {
        userId: user.id,
        packageId: body.packageId,
        amount: body.amount,
      })
    }

    const result = await initiateSTKPush(body.phone, body.amount, user.id, body.packageId)

    return NextResponse.json(result)
  } catch (error) {
    logger.error(`M-Pesa payment error: ${error.message}`)
    return NextResponse.json({ success: false, message: "Payment initiation failed" }, { status: 500 })
  }
}

