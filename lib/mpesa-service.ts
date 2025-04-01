import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"

// Types for M-Pesa API responses
export interface MpesaResponse {
  success: boolean
  message?: string
  transactionId?: string
  responseCode?: string
  responseDescription?: string
  errorCode?: string
  errorMessage?: string
}

/**
 * Initiates an M-Pesa STK Push payment
 * @param phoneNumber - Customer phone number (format: 254XXXXXXXXX)
 * @param amount - Amount to charge
 * @param userId - User ID making the purchase
 * @param packageId - Data package ID being purchased
 * @returns Promise with transaction details
 */
export async function initiateMpesaPayment(
  phoneNumber: string,
  amount: number,
  userId: number,
  packageId: number,
): Promise<MpesaResponse> {
  try {
    // Format phone number (ensure it starts with 254)
    const formattedPhone = formatPhoneNumber(phoneNumber)

    // Validate phone
    if (!validatePhoneNumber(formattedPhone)) {
      return {
        success: false,
        message: "Invalid phone number format. Must be a valid Kenyan number",
      }
    }

    // Get the current timestamp for the request
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14)

    // Generate transaction reference
    const transactionCode = `DS${timestamp}${Math.floor(Math.random() * 1000)}`

    // Record transaction in database (pending status)
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        packageId,
        transactionCode,
        amount: amount,
        phone: formattedPhone,
        status: "pending",
        paymentMethod: "mpesa",
        metadata: {
          initiatedAt: new Date().toISOString(),
          requestId: uuidv4(),
        },
      },
    })

    // Get auth token (requires Consumer Key and Secret)
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString(
      "base64",
    )

    const tokenResponse = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    )

    if (!tokenResponse.ok) {
      const tokenData = await tokenResponse.json()
      console.error("M-Pesa token error:", tokenData)

      // Update transaction status
      await updateTransactionStatus(transaction.id, "failed", {
        errorStage: "auth",
        errorDetails: tokenData,
      })

      return {
        success: false,
        message: "Failed to authenticate with M-Pesa",
        errorCode: tokenData.errorCode,
        errorMessage: tokenData.errorMessage,
      }
    }

    const { access_token } = await tokenResponse.json()

    // Generate password for the request
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString(
      "base64",
    )

    // Prepare STK Push request
    const stkPushResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount), // M-Pesa requires whole numbers
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: transactionCode,
        TransactionDesc: "Data Bundle Purchase",
      }),
    })

    const stkPushData = await stkPushResponse.json()

    // Update transaction with STK response data
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        metadata: {
          ...(transaction.metadata as any),
          stkResponse: stkPushData,
        },
      },
    })

    if (stkPushData.ResponseCode !== "0") {
      // Update transaction status
      await updateTransactionStatus(transaction.id, "failed", {
        errorStage: "stk_push",
        errorDetails: stkPushData,
      })

      return {
        success: false,
        transactionId: transaction.transactionCode,
        message: stkPushData.ResponseDescription || "Failed to initiate payment",
        responseCode: stkPushData.ResponseCode,
        responseDescription: stkPushData.ResponseDescription,
      }
    }

    // Payment request initiated successfully
    return {
      success: true,
      transactionId: transaction.transactionCode,
      message: "STK push sent successfully",
      responseDescription: stkPushData.ResponseDescription,
    }
  } catch (error) {
    console.error("M-Pesa payment error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process payment",
    }
  }
}

/**
 * Checks the status of an M-Pesa transaction
 * @param transactionCode - The transaction code
 * @returns Promise with transaction status
 */
export async function checkTransactionStatus(transactionCode: string): Promise<MpesaResponse> {
  try {
    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { transactionCode },
      include: { dataPackage: true, user: true },
    })

    if (!transaction) {
      return {
        success: false,
        message: "Transaction not found",
      }
    }

    return {
      success: transaction.status === "completed",
      message:
        transaction.status === "completed"
          ? "Payment completed successfully"
          : transaction.status === "pending"
            ? "Payment is still being processed"
            : "Payment failed",
      transactionId: transaction.transactionCode,
    }
  } catch (error) {
    console.error("Transaction status check error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to check transaction status",
    }
  }
}

// Helper to update transaction status
async function updateTransactionStatus(
  transactionId: number,
  status: "pending" | "completed" | "failed",
  metadata?: any,
) {
  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status,
      metadata: metadata
        ? {
            ...(metadata as any),
          }
        : undefined,
    },
  })
}

// Helper to validate Kenyan phone numbers
function validatePhoneNumber(phone: string): boolean {
  return /^254(7[0-9]|1[0-9])[0-9]{7}$/.test(phone)
}

// Helper to format phone numbers to 254 format
function formatPhoneNumber(phone: string): string {
  // If starts with 0, replace with 254
  if (phone.startsWith("0")) {
    return "254" + phone.substring(1)
  }

  // If it doesn't start with 254, add it
  if (!phone.startsWith("254")) {
    return "254" + phone
  }

  return phone
}

