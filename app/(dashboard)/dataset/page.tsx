"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { rebuildDataset } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Upload, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function DatasetPage() {
  const { toast } = useToast()
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleRebuildDataset = async () => {
    try {
      setIsRebuilding(true)
      await rebuildDataset()

      toast({
        title: "Success",
        description: "Dataset rebuild process started successfully",
      })
    } catch (error) {
      console.error("Error rebuilding dataset:", error)
      toast({
        title: "Error",
        description: "Failed to rebuild dataset",
        variant: "destructive",
      })
    } finally {
      setIsRebuilding(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles(filesArray)
    }
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const totalFiles = uploadedFiles.length
    let processed = 0

    for (const file of uploadedFiles) {
      // In a real implementation, you would upload each file to your backend
      // For now, we'll just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 500))

      processed++
      setUploadProgress(Math.round((processed / totalFiles) * 100))
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsUploading(false)
    setUploadComplete(true)

    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${uploadedFiles.length} files`,
    })

    // Reset after a few seconds
    setTimeout(() => {
      setUploadedFiles([])
      setUploadComplete(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Update Dataset</h1>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </TabsTrigger>
          <TabsTrigger value="rebuild">
            <RefreshCw className="mr-2 h-4 w-4" />
            Rebuild Dataset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Student Images</CardTitle>
              <CardDescription>Upload new images to update the face recognition dataset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Images should be clear frontal face photos with good lighting. Name files in the format:{" "}
                  <code>StudentID_FullName.jpg</code> (e.g., <code>USN123_John_Doe.jpg</code>)
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <Label htmlFor="images">Select Images</Label>
                <div
                  className="flex flex-col items-center justify-center rounded-md border border-dashed p-8"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files) {
                      const filesArray = Array.from(e.dataTransfer.files)
                      setUploadedFiles(filesArray)
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Drag & drop files here</h3>
                    <p className="mt-2 text-sm text-muted-foreground">or click to browse files</p>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="mt-4 w-full max-w-xs"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md border p-4"
                  >
                    <h4 className="mb-2 font-medium">Selected Files ({uploadedFiles.length})</h4>
                    <div className="max-h-40 overflow-auto">
                      <ul className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="text-sm">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Upload complete! Files are being processed.</span>
                  </motion.div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpload} disabled={uploadedFiles.length === 0 || isUploading} className="w-full">
                {isUploading ? "Uploading..." : "Upload Images"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rebuild" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rebuild Face Recognition Dataset</CardTitle>
              <CardDescription>Rebuild the entire face recognition dataset from the source images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This process will rebuild the entire face recognition dataset from scratch. It may take some time
                  depending on the number of images in your dataset directory.
                </AlertDescription>
              </Alert>

              <div className="rounded-md bg-muted p-4">
                <h4 className="mb-2 font-medium">What this does:</h4>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Scans all images in the configured dataset directory</li>
                  <li>Extracts face encodings from each image</li>
                  <li>Rebuilds the face recognition database</li>
                  <li>Updates all recognition models with the new data</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRebuildDataset} disabled={isRebuilding} className="w-full" variant="destructive">
                {isRebuilding ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Rebuilding...
                  </>
                ) : (
                  "Rebuild Dataset"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
