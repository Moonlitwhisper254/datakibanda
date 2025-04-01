import winston from "winston"

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define log colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
}

// Add colors to winston
winston.addColors(colors)

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
)

// Define which transports to use based on environment
const transports = [
  // Always log to console
  new winston.transports.Console(),

  // Log errors to a file
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),

  // Log all to a file
  new winston.transports.File({ filename: "logs/all.log" }),

  // Log payment transactions to a separate file
  new winston.transports.File({
    filename: "logs/payments.log",
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
]

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
})

// Export specific logging functions for different contexts
export function logPaymentEvent(event: {
  id: string
  userId: string
  amount: number
  status: "pending" | "completed" | "failed"
  method: string
  error?: string
  metadata?: any
}) {
  logger.log({
    level: event.status === "failed" ? "error" : "info",
    message: "Payment transaction",
    timestamp: new Date().toISOString(),
    transactionId: event.id,
    userId: event.userId,
    amount: event.amount,
    status: event.status,
    paymentMethod: event.method,
    error: event.error || null,
    metadata: event.metadata || null,
  })
}

export function logAuthEvent(event: {
  userId?: string
  action: "login" | "logout" | "register" | "password_reset"
  status: "success" | "failed"
  ipAddress?: string
  userAgent?: string
  error?: string
}) {
  logger.log({
    level: event.status === "failed" ? "error" : "info",
    message: `Auth ${event.action}`,
    timestamp: new Date().toISOString(),
    userId: event.userId,
    action: event.action,
    status: event.status,
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    error: event.error || null,
  })
}

export default logger

