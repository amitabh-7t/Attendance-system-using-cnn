"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Search, UserPlus, Edit, Trash2, Camera, Upload, X } from "lucide-react"
import { getStudents, addStudent, updateStudent, deleteStudent } from "@/lib/api"
import { captureImageFromVideo, getWebcamStream, stopMediaStream } from "@/lib/utils"

export default function StudentsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Add/Edit student state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    id: "",
  })
  const [studentImage, setStudentImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")

  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [webcamError, setWebcamError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      setFilteredStudents(
        students.filter(
          (student) => student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query),
        ),
      )
    } else {
      setFilteredStudents(students)
    }
  }, [searchQuery, students])

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await getStudents()
      setStudents(data)
      setFilteredStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load student data. Please check if the backend is running.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
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

      setIsAddDialogOpen(false)
      resetForm()
      fetchStudents()
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

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.id) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("new_id", formData.id)

      if (studentImage) {
        formDataObj.append("image", studentImage)
      }

      await updateStudent(currentStudent.id, formDataObj)

      toast({
        title: "Success",
        description: "Student updated successfully",
      })

      setIsEditDialogOpen(false)
      resetForm()
      fetchStudents()
    } catch (error: any) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update student",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!currentStudent) return

    try {
      setIsSubmitting(true)
      await deleteStudent(currentStudent.id)

      toast({
        title: "Success",
        description: "Student deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      fetchStudents()
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      id: "",
    })
    setStudentImage(null)
    setPreviewImage(null)
    setWebcamError(null)
    stopWebcam()
    setActiveTab("upload")
  }

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
      setWebcamError(null)
      const mediaStream = await getWebcamStream()
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        // Wait for video to load metadata
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not found"))
            return
          }

          const video = videoRef.current

          const onLoadedMetadata = () => {
            video.removeEventListener("loadedmetadata", onLoadedMetadata)
            video.removeEventListener("error", onError)
            resolve()
          }

          const onError = () => {
            video.removeEventListener("loadedmetadata", onLoadedMetadata)
            video.removeEventListener("error", onError)
            reject(new Error("Failed to load video"))
          }

          video.addEventListener("loadedmetadata", onLoadedMetadata)
          video.addEventListener("error", onError)
        })

        await videoRef.current.play()
      }

      setIsWebcamOpen(true)
    } catch (error: any) {
      console.error("Error accessing webcam:", error)
      setWebcamError(error.message)
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
    setIsWebcamOpen(false)
    setWebcamError(null)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      try {
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
        setActiveTab("preview")
      } catch (error: any) {
        console.error("Error capturing photo:", error)
        toast({
          title: "Capture Error",
          description: "Failed to capture photo. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (student: any) => {
    setCurrentStudent(student)
    setFormData({
      name: student.name,
      id: student.id,
    })
    setPreviewImage(`data:image/jpeg;base64,${student.image}`)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (student: any) => {
    setCurrentStudent(student)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Student Database</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Manage students enrolled in the face recognition system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="absolute right-2 top-2.5" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell>
                          <div className="h-10 w-10 overflow-hidden rounded-full">
                            <img
                              src={`data:image/jpeg;base64,${student.image}`}
                              alt={student.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(student)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive"
                              onClick={() => openDeleteDialog(student)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No students found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {students.length === 0 ? "Start by adding students to the database" : "Try adjusting your search query"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Enter student details and upload a photo for face recognition</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="id">Student ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="DSU12345"
                />
              </div>
              <div className="grid gap-2">
                <Label>Student Photo</Label>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="webcam">
                      <Camera className="mr-2 h-4 w-4" />
                      Webcam
                    </TabsTrigger>
                    <TabsTrigger value="preview" disabled={!previewImage}>
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-2">
                    <div className="flex flex-col items-center gap-4">
                      {previewImage && activeTab === "upload" ? (
                        <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-background p-1"
                            onClick={() => {
                              setPreviewImage(null)
                              setStudentImage(null)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed">
                          <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
                            <Upload className="mb-2 h-8 w-8" />
                            <p>Click to upload</p>
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

                  <TabsContent value="webcam" className="mt-2">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative h-40 w-full overflow-hidden rounded-md border">
                        {isWebcamOpen ? (
                          <video
                            ref={videoRef}
                            className="h-full w-full rounded-md object-cover"
                            muted
                            playsInline
                            autoPlay
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center">
                            <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to start webcam</p>
                            {webcamError && <p className="mt-2 text-xs text-destructive">{webcamError}</p>}
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
                        ) : (
                          <Button type="button" onClick={startWebcam} className="w-full">
                            <Camera className="mr-2 h-4 w-4" />
                            Start Webcam
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-2">
                    <div className="flex flex-col items-center gap-4">
                      {previewImage ? (
                        <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-background p-1"
                            onClick={() => {
                              setPreviewImage(null)
                              setStudentImage(null)
                              setActiveTab("webcam")
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed">
                          <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
                            <Camera className="mb-2 h-8 w-8" />
                            <p>No photo captured</p>
                          </div>
                        </div>
                      )}
                      <div className="flex w-full gap-2">
                        <Button type="button" onClick={() => setActiveTab("webcam")} className="w-full">
                          <Camera className="mr-2 h-4 w-4" />
                          Retake Photo
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name || !formData.id || !studentImage}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog - Similar structure with same fixes */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information and photo</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-id">Student ID</Label>
                <Input
                  id="edit-id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                />
              </div>
              {/* Same photo upload/webcam interface as add dialog */}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name || !formData.id}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  "Update Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentStudent?.name}'s record and all associated data. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
