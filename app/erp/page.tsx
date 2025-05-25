"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

export default function ERPPage() {
  useEffect(() => {
    // Redirect after a short delay
    const timer = setTimeout(() => {
      window.location.href = "https://ums.mydsi.org/"
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <Card className="overflow-hidden rounded-2xl">
          <CardHeader>
            <CardTitle>Redirecting to DSU ERP</CardTitle>
            <CardDescription>You are being redirected to the DSU ERP login page</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-center text-muted-foreground">
              The DSU ERP system is handled externally. You will be redirected automatically in a few seconds.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="https://ums.mydsi.org/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to ERP Login Now
              </a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
