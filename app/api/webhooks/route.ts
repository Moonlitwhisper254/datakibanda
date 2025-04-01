import { NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import logger from "@/lib/logger"

const schema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(["payment.completed", "payment.failed", "user.registered"])),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request data
    try {
      schema.parse(body)
    } catch (error) {
      return NextResponse.json({ success: false, message: "Validation failed", errors: error.errors }, { status: 400 })
    }

    // Generate a secret for the webhook
    const secret = crypto.randomBytes(32).toString("hex")

    // Create webhook subscription
    const webhook = await prisma.webhook.create({
      data: {
        url: body.url,
        events: body.events,
        description: body.description,
        secret,
        isActive: true,
      },
    })

    logger.info(`New webhook subscription created: ${webhook.id}`, {
      url: webhook.url,
      events: webhook.events,
    })

    return NextResponse.json({
      success: true,
      message: "Webhook subscription created",
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret,
      },
    })
  } catch (error) {
    logger.error(`Error creating webhook subscription: ${error.message}`)
    return NextResponse.json({ success: false, message: "Failed to create webhook subscription" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const webhooks = await prisma.webhook.findMany({
      select: {
        id: true,
        url: true,
        events: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      webhooks,
    })
  } catch (error) {
    logger.error(`Error fetching webhooks: ${error.message}`)
    return NextResponse.json({ success: false, message: "Failed to fetch webhooks" }, { status: 500 })
  }
}

