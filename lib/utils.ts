import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function detectProvider(phone: string): "safaricom" | "airtel" | "telkom" {
  const formatted = phone.startsWith("0")
    ? "254" + phone.substring(1)
    : !phone.startsWith("254")
      ? "254" + phone
      : phone

  if (formatted.startsWith("2547")) return "safaricom"
  if (formatted.startsWith("2541")) return "airtel"
  return "telkom"
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^(07|01)[0-9]{8}$/.test(phone) || /^254(7|1)[0-9]{8}$/.test(phone)
}

export function formatPhoneNumber(phone: string): string {
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

