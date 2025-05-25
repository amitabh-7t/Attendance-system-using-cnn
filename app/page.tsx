"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, ClipboardList, Users, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - removed logo, keeping only text */}
      <section className="hero-bg relative py-24 md:py-32">
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <motion.h1
            className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            AI Face Attendance System
          </motion.h1>
          <motion.p
            className="mx-auto mb-8 max-w-2xl text-lg md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A modern attendance tracking solution for Dayananda Sagar University using facial recognition technology
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/recognition">
                <Camera className="mr-2 h-5 w-5" />
                Start Recognition
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/students">
                <Users className="mr-2 h-5 w-5" />
                Manage Students
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-12 text-center text-3xl font-bold text-primary">Features</h2>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Camera className="h-10 w-10" />}
              title="Live Recognition"
              description="Real-time face recognition for quick and accurate attendance tracking"
              href="/recognition"
              delay={0}
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Student Management"
              description="Easily add, edit, and manage student profiles with photos"
              href="/students"
              delay={0.1}
            />
            <FeatureCard
              icon={<ClipboardList className="h-10 w-10" />}
              title="Attendance Logs"
              description="Comprehensive attendance records with filtering options"
              href="/attendance"
              delay={0.2}
            />
            <FeatureCard
              icon={<ExternalLink className="h-10 w-10" />}
              title="ERP Integration"
              description="Seamless connection to DSU's ERP system"
              href="https://ums.mydsi.org/"
              external
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col items-center justify-between gap-8 lg:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="max-w-xl">
              <h2 className="mb-4 text-3xl font-bold text-primary">About the Project</h2>
              <p className="mb-6 text-muted-foreground">
                The AI Face Attendance System is developed by 4th Semester AIML students at Dayananda Sagar University.
                This project leverages modern facial recognition technology to automate the attendance tracking process,
                making it more efficient and accurate.
              </p>
              <p className="text-muted-foreground">
                The system features real-time face recognition, comprehensive attendance logs, and integration with the
                university's ERP system, providing a complete solution for attendance management.
              </p>
            </div>
            <div className="relative h-64 w-full max-w-md overflow-hidden rounded-2xl shadow-lg lg:h-80">
              <Image
                src="/images/dsu-campus.jpg"
                alt="DSU Campus"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  external = false,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  external?: boolean
  delay?: number
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ transitionDelay: `${delay}s` }}
    >
      <Card className="h-full overflow-hidden rounded-2xl border-2 hover:border-primary/20 transition-colors">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-4 text-primary">{icon}</div>
          <h3 className="mb-2 text-xl font-bold">{title}</h3>
          <p className="mb-4 flex-1 text-muted-foreground">{description}</p>
          {external ? (
            <Button asChild variant="outline" className="mt-auto">
              <a href={href} target="_blank" rel="noopener noreferrer">
                Learn More
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline" className="mt-auto">
              <Link href={href}>Learn More</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
