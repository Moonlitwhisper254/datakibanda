"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, X, Send } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

type Message = {
  id: string
  content: string
  sender: "user" | "admin"
  timestamp: Date
}

export function SupportChat() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages([...messages, userMessage])
    setMessage("")

    // Simulate admin typing
    setIsTyping(true)

    // Simulate admin response after delay
    setTimeout(() => {
      const adminMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAdminResponse(message),
        sender: "admin",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, adminMessage])
      setIsTyping(false)
    }, 1500)
  }

  // Simple response generator
  const getAdminResponse = (userMessage: string): string => {
    const userMessageLower = userMessage.toLowerCase()

    if (userMessageLower.includes("hello") || userMessageLower.includes("hi")) {
      return "Hello there! How can I assist you with DataSoko today?"
    } else if (userMessageLower.includes("bundle") || userMessageLower.includes("data")) {
      return "We offer a variety of data bundles for Safaricom, Airtel, and Telkom. You can check them out in the respective provider dashboards."
    } else if (userMessageLower.includes("payment") || userMessageLower.includes("mpesa")) {
      return "We support M-Pesa payments. When you select a bundle, you'll be prompted to enter your phone number to receive an STK push."
    } else if (userMessageLower.includes("referral") || userMessageLower.includes("refer")) {
      return "Our referral program lets you earn Ksh 20 for each friend who signs up using your referral link and makes a purchase. You can withdraw once you reach Ksh 1,000."
    } else if (
      userMessageLower.includes("problem") ||
      userMessageLower.includes("issue") ||
      userMessageLower.includes("help")
    ) {
      return "I'm sorry to hear you're having trouble. Could you please provide more details about the issue you're experiencing?"
    } else {
      return "Thank you for your message. Is there anything specific about our data bundles or services that you'd like to know more about?"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Chat Button */}
      <Button className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg" onClick={() => setIsOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 sm:w-96 shadow-xl z-50 flex flex-col max-h-[500px]">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
            <CardTitle className="text-base font-medium">Customer Support</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1 max-h-[350px]">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {msg.sender === "admin" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/support-avatar.png" alt="Support" />
                        <AvatarFallback>DS</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/support-avatar.png" alt="Support" />
                      <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t">
            <form
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
            >
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

