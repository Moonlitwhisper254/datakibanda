import axios from "axios"
import { v4 as uuidv4 } from "uuid"
import prisma from "./db"
import { formatPhoneNumber } from "./utils"
import logger, { logPaymentEvent } from "./logger"

// Determine API URL based on environment
const MPESA_API_URL =
  process.env.MPESA_ENVIRONMENT === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"

// Add retry logic for API calls
async function makeApiCall(fn: () => Promise<any>, maxRetries = 3, delay = 1000) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      logger.warn(`API call failed (attempt ${attempt}/${maxRetries}): ${error.message}`)

      if (attempt < maxRetries) {
        // Wait before retrying (with exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
      }
    }
  }

  throw lastError
}

export async function getAccessToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64")

  try {
    const response = await makeApiCall(() =>
      axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }),
    )

    logger.debug("M-Pesa access token obtained successfully")
    return response.data.access_token
  } catch (error) {
    logger.error(`Failed to get M-Pesa access token: ${error.message}`)
    throw new Error("Failed to authenticate with M-Pesa")
  }
}

export async function initiateSTKPush(phone: string, amount: number, userId: string, packageId?: string) {
  try {
    const accessToken = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14)
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString(
      "base64",
    )

    // Format phone (ensure 254 prefix)
    const formattedPhone = formatPhoneNumber(phone)

    // Generate transaction reference
    const reference = `DS${timestamp}${Math.floor(Math.random() * 1000)}`
    const requestId = uuidv4()

    logger.info(`Initiating M-Pesa STK push: ${amount} KES to ${formattedPhone}, ref: ${reference}`)

    const response = await makeApiCall(() =>
      axios.post(
        `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(amount), // M-Pesa requires whole numbers
          PartyA: formattedPhone,
          PartyB: process.env.MPESA_SHORTCODE,
          PhoneNumber: formattedPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: reference,
          TransactionDesc: "Data Bundle Purchase",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      ),
    )

    // Save transaction to database
    const transaction = await prisma.transaction.create({
      data: {
        id: requestId,
        amount,
        status: "pending",
        reference,
        phone: formattedPhone,
        userId,
        packageId,
        metadata: {
          request: response.data,
          timestamp,
          checkoutRequestId: response.data.CheckoutRequestID,
        },
      },
    })

    // Log the payment event
    logPaymentEvent({
      id: transaction.id,
      userId,
      amount,
      status: "pending",
      method: "mpesa",
      metadata: {
        reference,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
      },
    })

    return {
      success: response.data.ResponseCode === "0",
      transactionId: reference,
      message: response.data.ResponseDescription,
      responseDescription: response.data.ResponseDescription,
    }
  } catch (error) {
    logger.error(`M-Pesa STK push failed: ${error.message}`, { userId, phone, amount })

    // Log the failed payment event
    logPaymentEvent({
      id: uuidv4(),
      userId,
      amount,
      status: "failed",
      method: "mpesa",
      error: error.message,
    })

    throw new Error(`Failed to initiate M-Pesa payment: ${error.message}`)
  }
}

export async function handleCallback(data: any) {
  try {
    logger.info("M-Pesa callback received", { callbackData: JSON.stringify(data) })

    const callback = data.Body.stkCallback
    const resultCode = callback.ResultCode
    const checkoutRequestId = callback.CheckoutRequestID

    // Find transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        metadata: {
          path: ["checkoutRequestId"],
          equals: checkoutRequestId,
        },
      },
      include: {
        user: true,
        package: true,
      },
    })

    if (!transaction) {
      logger.error(`Transaction not found for CheckoutRequestID: ${checkoutRequestId}`)
      return
    }

    if (resultCode === "0") {
      // Success - extract details
      const items = callback.CallbackMetadata.Item
      const receiptNumber = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value
      const amount = items.find((i: any) => i.Name === "Amount")?.Value
      const phone = items.find((i: any) => i.Name === "PhoneNumber")?.Value
      const transactionDate = items.find((i: any) => i.Name === "TransactionDate")?.Value

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "completed",
          metadata: {
            ...transaction.metadata,
            receiptNumber,
            amountPaid: amount,
            phone,
            transactionDate,
            callbackData: data,
          },
        },
      })

      // Log successful payment
      logPaymentEvent({
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        status: "completed",
        method: "mpesa",
        metadata: {
          receiptNumber,
          transactionDate,
          reference: transaction.reference,
        },
      })

      // Activate the purchased data bundle
      if (transaction.packageId) {
        // In a real implementation, you would call the telecom provider's API here
        logger.info(`Activating ${transaction.package?.name} for user ${transaction.user?.phone}`)

        // TODO: Implement actual bundle activation with telecom provider API
        // For now, we'll just log it
      }
    } else {
      // Payment failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
          metadata: {
            ...transaction.metadata,
            callbackData: data,
            error: callback.ResultDesc,
            failedAt: new Date().toISOString(),
          },
        },
      })

      // Log failed payment
      logPaymentEvent({
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        status: "failed",
        method: "mpesa",
        error: callback.ResultDesc,
        metadata: {
          reference: transaction.reference,
          resultCode,
        },
      })
    }
  } catch (error) {
    logger.error(`Error processing M-Pesa callback: ${error.message}`, { data })
  }
}

export async function checkTransactionStatus(reference: string) {
  try {
    logger.info(`Checking transaction status for reference: ${reference}`)

    const transaction = await prisma.transaction.findFirst({
      where: { reference },
      include: { package: true },
    })

    if (!transaction) {
      logger.warn(`Transaction not found for reference: ${reference}`)
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
      transactionId: transaction.reference,
      status: transaction.status,
      metadata: transaction.metadata,
    }
  } catch (error) {
    logger.error(`Error checking transaction status: ${error.message}`, { reference })
    throw new Error(`Failed to check transaction status: ${error.message}`)
  }
}

// Add a function to query M-Pesa for transaction status
export async function queryMpesaTransactionStatus(checkoutRequestId: string) {
  try {
    const accessToken = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14)
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString(
      "base64",
    )

    logger.info(`Querying M-Pesa for transaction status: ${checkoutRequestId}`)

    const response = await makeApiCall(() =>
      axios.post(
        `${MPESA_API_URL}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: process.env.MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      ),
    )

    logger.info(`M-Pesa transaction status response: ${JSON.stringify(response.data)}`)

    return {
      success: response.data.ResponseCode === "0",
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
      responseData: response.data,
    }
  } catch (error) {
    logger.error(`Error querying M-Pesa transaction status: ${error.message}`, { checkoutRequestId })
    throw new Error(`Failed to query transaction status: ${error.message}`)
  }
}

