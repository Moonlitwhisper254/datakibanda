import { NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^(07|01)[0-9]{8}$/, "Invalid Kenyan phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const user = await createUser(data)

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      userId: user.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 400 })
  }
}

