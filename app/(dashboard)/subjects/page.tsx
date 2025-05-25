"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Define subject and slot types
type Subject = {
  code: string
  name: string
  description: string
}

type Slot = {
  id: string
  time: string
  description: string
}

export default function SubjectsPage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")

  // 4th semester AIML subjects
  const subjects: Subject[] = [
    { code: "AI", name: "Artificial Intelligence", description: "Fundamentals of AI and intelligent systems" },
    {
      code: "DAA",
      name: "Design & Analysis of Algorithms",
      description: "Algorithm design techniques and complexity analysis",
    },
    { code: "TOC", name: "Theory of Computation", description: "Formal languages, automata, and computability" },
    { code: "FSD", name: "Full Stack Development", description: "End-to-end web application development" },
    { code: "DBMS", name: "Database Management Systems", description: "Database design, SQL, and management" },
    {
      code: "TNT",
      name: "Techniques for Non-Tabular Data",
      description: "Processing non-tabular data like images and text",
    },
    { code: "SEC", name: "Soft & Entrepreneurial Skills", description: "Professional and business skills development" },
    { code: "CTS", name: "Computational Thinking Skills", description: "Problem-solving and algorithmic thinking" },
  ]

  // Time slots
  const morningSlots: Slot[] = [
    { id: "m1", time: "9:00 AM - 10:00 AM", description: "First Period" },
    { id: "m2", time: "10:00 AM - 11:00 AM", description: "Second Period" },
    { id: "m3", time: "11:15 AM - 12:15 PM", description: "Third Period" },
    { id: "m4", time: "12:15 PM - 1:15 PM", description: "Fourth Period" },
  ]

  const afternoonSlots: Slot[] = [
    { id: "a1", time: "2:00 PM - 3:00 PM", description: "Fifth Period" },
    { id: "a2", time: "3:00 PM - 4:00 PM", description: "Sixth Period" },
    { id: "a3", time: "4:15 PM - 5:15 PM", description: "Seventh Period" },
    { id: "a4", time: "5:15 PM - 6:15 PM", description: "Eighth Period" },
  ]

  const handleStartRecognition = () => {
    if (selectedSubject && selectedSlot) {
      // Store the selected subject and slot in session storage
      sessionStorage.setItem("selectedSubject", selectedSubject)
      sessionStorage.setItem("selectedSlot", selectedSlot)

      // Navigate to recognition page
      router.push("/recognition")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subjects & Slots</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Select Subject
            </CardTitle>
            <CardDescription>Choose the subject for attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.code} value={subject.code}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSubject && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-muted p-3"
                >
                  <p className="font-medium">{subjects.find((s) => s.code === selectedSubject)?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {subjects.find((s) => s.code === selectedSubject)?.description}
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Select Time Slot
            </CardTitle>
            <CardDescription>Choose the time slot for attendance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="morning">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="morning">Morning</TabsTrigger>
                <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
              </TabsList>
              <TabsContent value="morning" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="morning-slot">Morning Slot</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger id="morning-slot">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {morningSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.time} ({slot.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="afternoon" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="afternoon-slot">Afternoon Slot</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger id="afternoon-slot">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {afternoonSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.time} ({slot.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-muted p-3 mt-4"
              >
                <p className="font-medium">
                  {[...morningSlots, ...afternoonSlots].find((s) => s.id === selectedSlot)?.time}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {[...morningSlots, ...afternoonSlots].find((s) => s.id === selectedSlot)?.description}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleStartRecognition}
          disabled={!selectedSubject || !selectedSlot}
          className="mt-4"
        >
          Start Recognition
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
