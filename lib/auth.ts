import { hash, compare } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import prisma from "./db"
import { generateReferralCode, detectProvider } from "./utils"
import logger, { logAuthEvent } from "./logger"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 15

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch (error) {
    logger.warn(`Invalid token: ${error.message}`)
    return null
  }
}

export async function createUser({
  name,
  email,
  phone,
  password,
  referralCode,
  ipAddress,
  userAgent,
}: {
  name: string
  email: string
  phone: string
  password: string
  referralCode?: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    logger.info(`Creating new user: ${email}, ${phone}`)

    const hashedPassword = await hashPassword(password)
    const provider = detectProvider(phone)
    const userReferralCode = generateReferralCode()

    return await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash: hashedPassword,
          provider,
          referralCode: userReferralCode,
        },
      })

      // Handle referral if applicable
      if (referralCode) {
        const referrer = await tx.user.findUnique({
          where: { referralCode },
        })

        if (referrer) {
          await tx.referral.create({
            data: {
              referrerId: referrer.id,
              referredId: user.id,
            },
          })

          await tx.user.update({
            where: { id: referrer.id },
            data: {
              balance: {
                increment: 20.0,
              },
            },
          })

          logger.info(`User ${user.id} was referred by ${referrer.id}, added 20.0 to referrer balance`)
        }
      }

      // Log successful registration
      logAuthEvent({
        userId: user.id,
        action: "register",
        status: "success",
        ipAddress,
        userAgent,
      })

      return user
    })
  } catch (error) {
    // Log failed registration
    logAuthEvent({
      action: "register",
      status: "failed",
      error: error.message,
      ipAddress,
      userAgent,
    })

    throw error
  }
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
  try {
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 24) // 24 hour expiry

    const session = await prisma.authSession.create({
      data: {
        id: uuidv4(),
        userId,
        ipAddress,
        userAgent,
        expiresAt: expiryDate,
      },
    })

    logger.info(`Created new session for user ${userId}`)
    return session.id
  } catch (error) {
    logger.error(`Failed to create session for user ${userId}: ${error.message}`)
    throw error
  }
}

export async function validateSession(sessionId: string): Promise<string | null> {
  try {
    const session = await prisma.authSession.findUnique({
      where: {
        id: sessionId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!session) {
      logger.debug(`Invalid or expired session: ${sessionId}`)
      return null
    }

    return session.userId
  } catch (error) {
    logger.error(`Error validating session ${sessionId}: ${error.message}`)
    return null
  }
}

export async function authenticateUser(
  identifier: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ user: any | null; error?: string }> {
  try {
    // Check if identifier is email or phone
    const isEmail = identifier.includes("@")
    logger.info(`Login attempt for ${isEmail ? "email" : "phone"}: ${identifier}`)

    // Find the user
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { phone: identifier },
    })

    if (!user) {
      logAuthEvent({
        action: "login",
        status: "failed",
        error: "User not found",
        ipAddress,
        userAgent,
      })
      return { user: null, error: "Invalid credentials" }
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      logAuthEvent({
        userId: user.id,
        action: "login",
        status: "failed",
        error: "Account locked",
        ipAddress,
        userAgent,
      })
      return {
        user: null,
        error: `Account is locked. Try again after ${user.accountLockedUntil.toLocaleTimeString()}`,
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failedLoginAttempts + 1
      let lockUntil = null

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock account
        const now = new Date()
        lockUntil = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60000) // 15 minutes
        logger.warn(`Account locked for user ${user.id} after ${MAX_LOGIN_ATTEMPTS} failed attempts`)
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          accountLockedUntil: lockUntil,
        },
      })

      logAuthEvent({
        userId: user.id,
        action: "login",
        status: "failed",
        error: "Invalid password",
        ipAddress,
        userAgent,
      })

      return { user: null, error: "Invalid credentials" }
    }

    // Reset failed login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    })

    logAuthEvent({
      userId: user.id,
      action: "login",
      status: "success",
      ipAddress,
      userAgent,
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        provider: user.provider,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
      },
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`)
    logAuthEvent({
      action: "login",
      status: "failed",
      error: error.message,
      ipAddress,
      userAgent,
    })
    return { user: null, error: "An error occurred during authentication" }
  }
}

export async function getCurrentUser(sessionId: string): Promise<any | null> {
  if (!sessionId) {
    return null
  }

  try {
    const userId = await validateSession(sessionId)

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      provider: user.provider,
      isVerified: user.isVerified,
      referralCode: user.referralCode,
    }
  } catch (error) {
    logger.error(`Error getting current user: ${error.message}`)
    return null
  }
}

export async function revokeSession(sessionId: string): Promise<boolean> {
  try {
    await prisma.authSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    })

    logger.info(`Session revoked: ${sessionId}`)
    return true
  } catch (error) {
    logger.error(`Failed to revoke session ${sessionId}: ${error.message}`)
    return false
  }
}

