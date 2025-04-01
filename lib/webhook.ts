import crypto from "crypto"
import axios from "axios"
import prisma from "./db"
import logger from "./logger"

// Generate a signature for webhook payload
export function generateSignature(payload: any, secret: string): string {
  return crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex")
}

// Verify webhook signature
export function verifySignature(payload: any, signature: string, secret: string): boolean {
  const expectedSignature = generateSignature(payload, secret)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

// Send webhook notification
export async function sendWebhook(event: string, data: any, url: string, secret: string) {
  try {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    }

    const signature = generateSignature(payload, secret)

    logger.info(`Sending webhook to ${url}`, { event })

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      timeout: 10000, // 10 second timeout
    })

    logger.info(`Webhook sent successfully to ${url}`, {
      event,
      statusCode: response.status,
    })

    return {
      success: true,
      statusCode: response.status,
    }
  } catch (error) {
    logger.error(`Failed to send webhook to ${url}: ${error.message}`, { event })

    return {
      success: false,
      error: error.message,
    }
  }
}

// Process payment completion webhook
export async function processPaymentWebhook(transactionId: string) {
  try {
    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
        package: true,
      },
    })

    if (!transaction) {
      logger.error(`Transaction not found for webhook: ${transactionId}`)
      return
    }

    // Find all webhook subscriptions for payment events
    const webhooks = await prisma.webhook.findMany({
      where: {
        events: {
          has: "payment.completed",
        },
        isActive: true,
      },
    })

    if (webhooks.length === 0) {
      logger.debug("No webhook subscriptions found for payment.completed event")
      return
    }

    // Prepare webhook payload
    const payload = {
      transactionId: transaction.id,
      reference: transaction.reference,
      amount: transaction.amount,
      status: transaction.status,
      packageId: transaction.packageId,
      userId: transaction.userId,
      createdAt: transaction.createdAt,
    }

    // Send to all subscribers
    for (const webhook of webhooks) {
      await sendWebhook("payment.completed", payload, webhook.url, webhook.secret)
    }
  } catch (error) {
    logger.error(`Error processing payment webhook: ${error.message}`)
  }
}

