"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  { name: "Screening", href: "/" },
  { name: "Database", href: "/database" },
  { name: "About", href: "/about" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo placeholder */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">cerv.AI</span>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Logo placeholder on the right */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>DOST-ASTI</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
