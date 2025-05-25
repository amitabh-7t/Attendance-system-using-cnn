"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Students", href: "/students" },
    { name: "Live Recognition", href: "/recognition" },
    { name: "Attendance Log", href: "/attendance" },
    { name: "Upload", href: "/upload" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass dark:glass-dark border-b shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/dsu-logo.png"
                alt="DSU Logo"
                width={50}
                height={50}
                className="h-12 w-auto"
                priority
              />
              <span className="hidden font-bold text-primary md:inline-block lg:text-lg">
                AI Face Attendance System - DSU
              </span>
              <span className="font-bold text-primary md:hidden">DSU Attendance</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
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
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <a href="https://ums.mydsi.org/" target="_blank" rel="noopener noreferrer">
                ERP Login
              </a>
            </Button>
            <ModeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="icon" aria-label="Toggle Menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass dark:glass-dark border-b shadow-sm md:hidden"
        >
          <nav className="container mx-auto flex flex-col space-y-3 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <a
                href="https://ums.mydsi.org/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                ERP Login
              </a>
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  )
}
