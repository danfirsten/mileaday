"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Award, BarChart3, Calendar, History, Home, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Log Run",
    href: "/dashboard/log",
    icon: Calendar,
  },
  {
    name: "Run History",
    href: "/dashboard/history",
    icon: History,
  },
  {
    name: "Statistics",
    href: "/dashboard/stats",
    icon: BarChart3,
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: Award,
  },
  {
    name: "Community",
    href: "/dashboard/community",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start px-2 py-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
            pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

