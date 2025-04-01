import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../lib/auth"

const prisma = new PrismaClient()

async function main() {
  // Create sample data packages
  const safaricomPackages = [
    {
      name: "Daily Lite",
      description: "Perfect for light browsing and messaging",
      price: 10,
      validity: 1,
      dataVolume: "40MB",
      provider: "safaricom",
      category: "daily",
    },
    {
      name: "Daily Basic",
      description: "Great for social media and light streaming",
      price: 20,
      validity: 1,
      dataVolume: "100MB",
      provider: "safaricom",
      category: "daily",
    },
    {
      name: "Daily Plus",
      description: "Ideal for video calls and streaming",
      price: 50,
      validity: 1,
      dataVolume: "400MB",
      provider: "safaricom",
      category: "daily",
    },
    {
      name: "Daily Premium",
      description: "High-speed data for all your daily needs",
      price: 99,
      validity: 1,
      dataVolume: "1GB",
      provider: "safaricom",
      category: "daily",
    },
  ]

  for (const pkg of safaricomPackages) {
    await prisma.dataPackage.create({
      data: pkg,
    })
  }

  // Create a test user
  const hashedPassword = await hashPassword("Password123!")
  await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      phone: "0712345678",
      passwordHash: hashedPassword,
      provider: "safaricom",
      referralCode: "TESTCODE",
      isVerified: true,
    },
  })

  console.log("Seed data created successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

