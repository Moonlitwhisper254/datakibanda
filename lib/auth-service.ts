import { hash, compare } from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { sign, verify } from "jsonwebtoken"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

// Constants
const SALT_ROUNDS = 12
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret"
const JWT_EXPIRY = "1h"
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MINUTES = 15

export type AuthUser = {
  id: number
  name: string
  email: string
  phone: string
  provider: string
  isVerified: boolean
  referralCode: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId: number): string {
  return sign(
    {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
      iss: "datasoko.com",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY },
  )
}

// Verify JWT token
export function verifyToken(token: string): number | null {
  try {
    const decoded = verify(token, JWT_SECRET) as { sub: number }
    return decoded.sub
  } catch (error) {
    return null
  }
}

// Create a session
export async function createSession(userId: number, ipAddress?: string): Promise<string> {
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 1) // 1 hour expiry

  const session = await prisma.authSession.create({
    data: {
      id: uuidv4(),
      userId,
      ipAddress,
      expiresAt: expiryDate,
    },
  })

  return session.id
}

// Validate session
export async function validateSession(sessionId: string): Promise<number | null> {
  const session = await prisma.authSession.findUnique({
    where: {
      id: sessionId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  return session ? session.userId : null
}

// Get user by credentials
export async function authenticateUser(
  identifier: string,
  password: string,
  ipAddress?: string,
): Promise<{ user: AuthUser | null; error?: string }> {
  // Check if identifier is email or phone
  const isEmail = identifier.includes("@")

  // Find the user
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: identifier } : { phone: identifier },
  })

  if (!user) {
    return { user: null, error: "Invalid credentials" }
  }

  // Check if account is locked
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
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
      lockUntil = new Date(now.getTime() + LOCK_DURATION_MINUTES * 60000)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: new Date(),
        accountLockedUntil: lockUntil,
      },
    })

    return { user: null, error: "Invalid credentials" }
  }

  // Reset failed login attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
    },
  })

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    provider: user.provider,
    isVerified: user.isVerified,
    referralCode: user.referralCode,
  }

  return { user: authUser }
}

// Get current user from session
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return null
  }

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
}

