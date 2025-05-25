"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Upload, User, AlertCircle, CheckCircle2, BookOpen, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { recognizeFaceBase64 } from "@/lib/api"
import { captureImageFromVideo, getWebcamStream, stopMediaStream } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function RecognitionPage() {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeTab, setActiveTab] = useState("webcam")
  const [tolerance, setTolerance] = useState(0.5)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState<{
    name: string
    id: string
    image: string
  } | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [recognizedStudents, setRecognizedStudents] = useState<Set<string>>(new Set())
  const [showSuccess, setShowSuccess] = useState(false)
  const [subjectInfo, setSubjectInfo] = useState({ code: "", slot: "" })

  // Initialize webcam when component mounts
  useEffect(() => {
    // Get subject and slot from session storage
    const selectedSubject = sessionStorage.getItem("selectedSubject") || ""
    const selectedSlot = sessionStorage.getItem("selectedSlot") || ""
    setSubjectInfo({ code: selectedSubject, slot: selectedSlot })

    if (activeTab === "webcam") {
      startWebcam()
    }

    return () => {
      stopWebcam()
    }
  }, [activeTab])

  const startWebcam = async () => {
    try {
      const mediaStream = await getWebcamStream()
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setShowPreview(true)
      }
    } catch (error: any) {
      console.error("Error accessing webcam:", error)
      toast({
        title: "Webcam Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const stopWebcam = () => {
    stopMediaStream(stream)
    setStream(null)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsStreaming(false)
  }

  const startRecognition = () => {
    // Reset recognized students set when starting a new session
    setRecognizedStudents(new Set())

    if (activeTab === "webcam") {
      setIsStreaming(true)

      // Perform recognition every 2 seconds to avoid overwhelming the API
      intervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const imageData = captureImageFromVideo(videoRef.current)
          performRecognition(imageData)
        }
      }, 2000)
    } else if (activeTab === "upload" && uploadedImage) {
      performRecognition(uploadedImage)
    }
  }

  const stopRecognition = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsStreaming(false)
  }

  const performRecognition = async (imageData: string) => {
    try {
      setIsRecognizing(true)
      const result = await recognizeFaceBase64(imageData, tolerance)
      setRecognitionResult(result)

      if (result.name !== "Unknown" && result.id !== "Unknown") {
        // Check if this student has already been recognized in this session
        if (!recognizedStudents.has(result.id)) {
          // Add to recognized set
          setRecognizedStudents((prev) => new Set(prev).add(result.id))

          // Show success animation
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)

          // Show toast notification
          toast({
            title: "Attendance Marked",
            description: `${result.name} (ID: ${result.id}) has been recognized and marked present for ${subjectInfo.code}.`,
            variant: "default",
          })
        }
      }
    } catch (error: any) {
      console.error("Recognition error:", error)
      toast({
        title: "Recognition Error",
        description:
          error.response?.data?.detail ||
          "An error occurred during face recognition. Please check if the backend is running.",
        variant: "destructive",
      })
    } finally {
      setIsRecognizing(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Live Recognition</h1>
        {subjectInfo.code && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {subjectInfo.code}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {subjectInfo.slot}
            </Badge>
          </div>
        )}
      </div>

      {!subjectInfo.code && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No subject selected</AlertTitle>
          <AlertDescription>
            Please select a subject and time slot before starting recognition.
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href="/subjects">Go to Subject Selection</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Face Recognition</CardTitle>
              <CardDescription>Recognize faces in real-time using webcam or upload an image</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="webcam" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="webcam">
                    <Camera className="mr-2 h-4 w-4" />
                    Webcam
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="webcam" className="mt-4">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                    {isRecognizing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                    {showSuccess && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 attendance-success">
                        <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg flex items-center gap-2">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                          <span className="font-medium">Attendance Marked!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {uploadedImage ? (
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center">
                          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Upload an image to recognize faces</p>
                        </div>
                      )}
                      {isRecognizing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        </div>
                      )}
                      {showSuccess && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 attendance-success">
                          <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            <span className="font-medium">Attendance Marked!</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex w-full gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Select Image
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      {uploadedImage && (
                        <Button variant="outline" className="w-full" onClick={() => setUploadedImage(null)}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center gap-4">
                <span className="text-sm">Tolerance:</span>
                <Slider
                  value={[tolerance]}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  onValueChange={(value) => setTolerance(value[0])}
                  className="flex-1"
                />
                <span className="w-10 text-right text-sm">{tolerance.toFixed(2)}</span>
              </div>
              {activeTab === "webcam" ? (
                <Button
                  className="w-full"
                  onClick={isStreaming ? stopRecognition : startRecognition}
                  variant={isStreaming ? "destructive" : "default"}
                  disabled={!subjectInfo.code}
                >
                  {isStreaming ? "Stop Recognition" : "Start Recognition"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={startRecognition}
                  disabled={!uploadedImage || isRecognizing || !subjectInfo.code}
                >
                  Recognize Face
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={recognitionResult?.id || "no-result"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recognition Result</CardTitle>
                  <CardDescription>Details of the recognized person</CardDescription>
                </CardHeader>
                <CardContent>
                  {recognitionResult ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary">
                        {recognitionResult.name !== "Unknown" ? (
                          <img
                            src={recognitionResult.image || "/placeholder.svg"}
                            alt={recognitionResult.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <User className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold">{recognitionResult.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {recognitionResult.id !== "Unknown" ? recognitionResult.id : "Not recognized"}
                        </p>
                      </div>
                      <div className="flex w-full items-center justify-center gap-2 rounded-full bg-muted p-2">
                        {recognitionResult.name !== "Unknown" ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">Recognized</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm font-medium">Not Recognized</span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <User className="mb-2 h-16 w-16 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No Recognition Data</h3>
                      <p className="text-sm text-muted-foreground">Start recognition to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Students marked present in this session</CardDescription>
            </CardHeader>
            <CardContent>
              {recognizedStudents.size > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {recognizedStudents.size} student{recognizedStudents.size !== 1 ? "s" : ""} marked present
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(recognizedStudents).map((id) => (
                      <Badge key={id} variant="secondary">
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No attendance recorded yet</p>
                  <p className="text-xs mt-1">Start recognition to mark attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
