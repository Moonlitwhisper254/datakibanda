"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Phone } from "lucide-react"

export default function SupportPage() {
  const { toast } = useToast()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "We'll get back to you as soon as possible.",
      })
      setSubject("")
      setMessage("")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help with your DataSoko account and services</p>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's your inquiry about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <span>Phone Support</span>
                </CardTitle>
                <CardDescription>Call us directly for immediate assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">0202030117</p>
                <p className="text-sm text-muted-foreground mt-1">Available Monday to Friday, 8am to 6pm</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="tel:+254202030117">Call Now</a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>WhatsApp Support</span>
                </CardTitle>
                <CardDescription>Chat with us on WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">0704424158</p>
                <p className="text-sm text-muted-foreground mt-1">Available 24/7 for your convenience</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://wa.me/254704424158" target="_blank" rel="noopener noreferrer">
                    Open WhatsApp
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about DataSoko</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I purchase a data bundle?</AccordionTrigger>
                  <AccordionContent>
                    To purchase a data bundle, navigate to the dashboard of your preferred provider (Safaricom, Airtel,
                    or Telkom), select the bundle category (Daily, 7 Days, 30 Days, etc.), choose your desired package,
                    and proceed to payment. You can pay using M-Pesa, card, or PayPal.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How does the referral program work?</AccordionTrigger>
                  <AccordionContent>
                    Our referral program allows you to earn Ksh 20 for each friend who signs up using your referral link
                    and makes a purchase. You can find your unique referral link in the Referrals section of your
                    dashboard. Once you've accumulated Ksh 1,000, you can withdraw your earnings to M-Pesa.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                  <AccordionContent>
                    We currently accept payments via M-Pesa. Card payments and PayPal integration are coming soon.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How long does it take for my data bundle to activate?</AccordionTrigger>
                  <AccordionContent>
                    Data bundles are typically activated within 5 minutes after successful payment. If you experience
                    any delays beyond this timeframe, please contact our support team.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I buy data for someone else?</AccordionTrigger>
                  <AccordionContent>
                    Yes, you can purchase data bundles for other people. During the checkout process, select "Someone
                    else" when asked who the bundle is for, and enter the recipient's phone number.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>What happens if my payment fails?</AccordionTrigger>
                  <AccordionContent>
                    If your payment fails, no money will be deducted from your account. You can try again or contact our
                    support team for assistance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>How do I check my active bundles?</AccordionTrigger>
                  <AccordionContent>
                    You can check your active bundles in the dashboard under the "Active Bundles" section.
                    Alternatively, you can dial the USSD code for your network provider to check your data balance.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat Support</CardTitle>
              <CardDescription>Chat with our support team in real-time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Chat with us</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our support team is available to help you with any questions or issues
                </p>
                <Button className="mt-4">Start Chat</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

