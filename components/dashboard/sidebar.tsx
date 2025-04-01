"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Phone, Settings, Users, CreditCard, BarChart3, HelpCircle } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Safaricom",
    href: "/dashboard/safaricom",
    icon: Phone,
    color: "text-green-600",
  },
  {
    title: "Airtel",
    href: "/dashboard/airtel",
    icon: Phone,
    color: "text-red-600",
  },
  {
    title: "Telkom",
    href: "/dashboard/telkom",
    icon: Phone,
    color: "text-blue-600",
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "group fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 md:relative",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="flex-1 space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("mr-3 h-5 w-5 flex-shrink-0", item.color, isActive && "text-primary-foreground")}
                />
                <span className={cn("transition-opacity", isCollapsed ? "opacity-0" : "opacity-100")}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>
  )
}

