"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Upload, AlertCircle, X } from "lucide-react"
import { captureImageFromVideo, getWebcamStream } from "@/lib/utils"

// Mock function for adding a student - replace with actual API call
const addStudent = async (formData: FormData) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // For demo purposes, always return success
  return { success: true }
}

export default function UploadPage() {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [formData, setFormData] = useState({
    name: "",
    id: "",
  })
  const [studentImage, setStudentImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setStudentImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startWebcam = async () => {
    try {
      const mediaStream = await getWebcamStream()
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      setIsWebcamOpen(true)
    } catch (error) {
      console.error("Error accessing webcam:", error)
      toast({
        title: "Webcam Error",
        description: "Could not access the webcam. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    setIsWebcamOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const imageData = captureImageFromVideo(videoRef.current)
      setPreviewImage(imageData)

      // Convert data URL to File object
      fetch(imageData)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" })
          setStudentImage(file)
        })

      stopWebcam()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      id: "",
    })
    setStudentImage(null)
    setPreviewImage(null)
    stopWebcam()
    setActiveTab("upload")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.id || !studentImage) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and provide an image",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("student_id", formData.id)
      formDataObj.append("image", studentImage)

      await addStudent(formDataObj)

      toast({
        title: "Success",
        description: "Student added successfully",
      })

      resetForm()
    } catch (error: any) {
      console.error("Error adding student:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add student",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-primary">Upload Student</h1>

      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden rounded-2xl">
          <CardHeader>
            <CardTitle>Add New Student</CardTitle>
            <CardDescription>Enter student details and upload a photo for face recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="id">Student ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="DSU12345"
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Student Photo</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </TabsTrigger>
                      <TabsTrigger value="webcam">
                        <Camera className="mr-2 h-4 w-4" />
                        Use Webcam
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-4">
                      <div className="flex flex-col items-center gap-4">
                        {previewImage && activeTab === "upload" ? (
                          <div className="relative h-48 w-48 overflow-hidden rounded-xl border">
                            <img
                              src={previewImage || "/placeholder.svg"}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2 rounded-full bg-background p-1 shadow-md"
                              onClick={() => {
                                setPreviewImage(null)
                                setStudentImage(null)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed"
                            onClick={() => document.getElementById("student-photo")?.click()}
                          >
                            <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
                              <Upload className="mb-2 h-10 w-10" />
                              <p>Click to upload</p>
                              <p className="mt-1 text-xs">PNG, JPG or JPEG</p>
                            </div>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("student-photo")?.click()}
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Select Image
                        </Button>
                        <input
                          id="student-photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="webcam" className="mt-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative h-48 w-full overflow-hidden rounded-xl border">
                          {isWebcamOpen ? (
                            <video ref={videoRef} className="h-full w-full rounded-xl object-cover" muted playsInline />
                          ) : previewImage ? (
                            <div className="relative h-full w-full">
                              <img
                                src={previewImage || "/placeholder.svg"}
                                alt="Captured"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                className="absolute right-2 top-2 rounded-full bg-background p-1 shadow-md"
                                onClick={() => {
                                  setPreviewImage(null)
                                  setStudentImage(null)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center">
                              <Camera className="mb-2 h-10 w-10 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to start webcam</p>
                            </div>
                          )}
                        </div>
                        <div className="flex w-full gap-2">
                          {isWebcamOpen ? (
                            <>
                              <Button type="button" onClick={capturePhoto} className="w-full">
                                <Camera className="mr-2 h-4 w-4" />
                                Capture Photo
                              </Button>
                              <Button type="button" variant="outline" onClick={stopWebcam} className="w-full">
                                Cancel
                              </Button>
                            </>
                          ) : previewImage ? (
                            <Button type="button" onClick={startWebcam} className="w-full">
                              <Camera className="mr-2 h-4 w-4" />
                              Retake Photo
                            </Button>
                          ) : (
                            <Button type="button" onClick={startWebcam} className="w-full">
                              <Camera className="mr-2 h-4 w-4" />
                              Start Webcam
                            </Button>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Please ensure the photo clearly shows the student's face with good lighting and a neutral
                    background.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.id || !studentImage}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
