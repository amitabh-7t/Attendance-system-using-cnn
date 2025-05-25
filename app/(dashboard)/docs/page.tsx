"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Database, Camera, Server, Book } from "lucide-react"
import { motion } from "framer-motion"

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">
            <Book className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tech">
            <Code className="mr-2 h-4 w-4" />
            Technologies
          </TabsTrigger>
          <TabsTrigger value="api">
            <Server className="mr-2 h-4 w-4" />
            API Endpoints
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="recognition">
            <Camera className="mr-2 h-4 w-4" />
            Recognition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Understanding the Face Recognition Attendance System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-medium">Introduction</h3>
                <p className="mt-2 text-muted-foreground">
                  The Face Recognition Attendance System is a modern solution for tracking student attendance using
                  facial recognition technology. The system automatically identifies students through webcam or uploaded
                  images and records their attendance in real-time.
                </p>

                <h3 className="mt-6 text-lg font-medium">Key Features</h3>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>Real-time face recognition for attendance tracking</li>
                  <li>Student database management with CRUD operations</li>
                  <li>Comprehensive attendance logs with filtering capabilities</li>
                  <li>Dataset management for face recognition models</li>
                  <li>Modern, responsive user interface</li>
                </ul>

                <h3 className="mt-6 text-lg font-medium">System Architecture</h3>
                <p className="mt-2 text-muted-foreground">The system follows a client-server architecture:</p>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>Frontend:</strong> Next.js application with React components and TailwindCSS
                  </li>
                  <li>
                    <strong>Backend:</strong> FastAPI server exposing RESTful endpoints
                  </li>
                  <li>
                    <strong>Face Recognition:</strong> Python-based face recognition using OpenCV and face_recognition
                    libraries
                  </li>
                  <li>
                    <strong>Database:</strong> SQLite for attendance records and pickle files for face encodings
                  </li>
                </ul>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech">
          <Card>
            <CardHeader>
              <CardTitle>Technologies Used</CardTitle>
              <CardDescription>The tech stack powering the Face Recognition Attendance System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-medium">Frontend</h3>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>Next.js:</strong> React framework for building the user interface
                  </li>
                  <li>
                    <strong>TailwindCSS:</strong> Utility-first CSS framework for styling
                  </li>
                  <li>
                    <strong>shadcn/ui:</strong> Reusable UI components built with Radix UI and Tailwind
                  </li>
                  <li>
                    <strong>Framer Motion:</strong> Animation library for smooth transitions
                  </li>
                  <li>
                    <strong>Axios:</strong> Promise-based HTTP client for API requests
                  </li>
                  <li>
                    <strong>Lucide Icons:</strong> Beautiful, consistent icon set
                  </li>
                </ul>

                <h3 className="mt-6 text-lg font-medium">Backend</h3>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>FastAPI:</strong> Modern, fast web framework for building APIs with Python
                  </li>
                  <li>
                    <strong>Uvicorn:</strong> ASGI server for running the FastAPI application
                  </li>
                  <li>
                    <strong>OpenCV:</strong> Computer vision library for image processing
                  </li>
                  <li>
                    <strong>face_recognition:</strong> Library for face detection and recognition
                  </li>
                  <li>
                    <strong>SQLite:</strong> Lightweight disk-based database for attendance records
                  </li>
                  <li>
                    <strong>Pydantic:</strong> Data validation and settings management
                  </li>
                </ul>

                <h3 className="mt-6 text-lg font-medium">Development Tools</h3>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>Git:</strong> Version control system
                  </li>
                  <li>
                    <strong>Poetry/pip:</strong> Python package management
                  </li>
                  <li>
                    <strong>npm/yarn:</strong> JavaScript package management
                  </li>
                  <li>
                    <strong>ESLint/Prettier:</strong> Code linting and formatting
                  </li>
                </ul>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>RESTful API endpoints for interacting with the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-medium">Student Endpoints</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Endpoint</th>
                        <th className="py-2 text-left font-medium">Method</th>
                        <th className="py-2 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-mono text-sm">/students</td>
                        <td className="py-2">GET</td>
                        <td className="py-2">Get all students</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/students/{"{student_id}"}</td>
                        <td className="py-2">GET</td>
                        <td className="py-2">Get student by ID</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/students</td>
                        <td className="py-2">POST</td>
                        <td className="py-2">Add a new student</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/students/base64</td>
                        <td className="py-2">POST</td>
                        <td className="py-2">Add a new student with base64 image</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/students/{"{student_id}"}</td>
                        <td className="py-2">PUT</td>
                        <td className="py-2">Update student information</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/students/{"{student_id}"}</td>
                        <td className="py-2">DELETE</td>
                        <td className="py-2">Delete a student</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="mt-6 text-lg font-medium">Recognition Endpoints</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Endpoint</th>
                        <th className="py-2 text-left font-medium">Method</th>
                        <th className="py-2 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-mono text-sm">/recognize</td>
                        <td className="py-2">POST</td>
                        <td className="py-2">Recognize face in an uploaded image</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/recognize/base64</td>
                        <td className="py-2">POST</td>
                        <td className="py-2">Recognize face in a base64 encoded image</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/webcam</td>
                        <td className="py-2">GET</td>
                        <td className="py-2">Stream webcam with face recognition</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="mt-6 text-lg font-medium">Attendance Endpoints</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Endpoint</th>
                        <th className="py-2 text-left font-medium">Method</th>
                        <th className="py-2 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-mono text-sm">/attendance</td>
                        <td className="py-2">GET</td>
                        <td className="py-2">Get attendance logs with optional filters</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">/attendance</td>
                        <td className="py-2">POST</td>
                        <td className="py-2">Manually mark attendance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="mt-6 text-lg font-medium">Dataset Endpoints</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Endpoint</th>
                        <th className="py-2 text-left font-medium">Method</th>
                        <th className="py-2 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-mono text-sm">/dataset/rebuild</td>
                        <td className="py-2">POST</td>
                        <td className="py-2">Rebuild the dataset from images</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Structure</CardTitle>
              <CardDescription>Understanding the data storage in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-medium">Face Recognition Database</h3>
                <p className="mt-2 text-muted-foreground">
                  The face recognition database is stored as a Python pickle file containing face encodings and student
                  information. Each entry in the database contains:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>id:</strong> Unique student identifier
                  </li>
                  <li>
                    <strong>name:</strong> Student's full name
                  </li>
                  <li>
                    <strong>image:</strong> Student's face image
                  </li>
                  <li>
                    <strong>encoding:</strong> 128-dimensional face encoding vector
                  </li>
                </ul>

                <h3 className="mt-6 text-lg font-medium">Attendance Database</h3>
                <p className="mt-2 text-muted-foreground">
                  Attendance records are stored in an SQLite database with the following schema:
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Column</th>
                        <th className="py-2 text-left font-medium">Type</th>
                        <th className="py-2 text-left font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-mono text-sm">id</td>
                        <td className="py-2">INTEGER</td>
                        <td className="py-2">Primary key, auto-incrementing</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">student_id</td>
                        <td className="py-2">TEXT</td>
                        <td className="py-2">Student identifier</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">student_name</td>
                        <td className="py-2">TEXT</td>
                        <td className="py-2">Student's full name</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">timestamp</td>
                        <td className="py-2">DATETIME</td>
                        <td className="py-2">When attendance was recorded</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-sm">status</td>
                        <td className="py-2">TEXT</td>
                        <td className="py-2">Attendance status (present, absent, late)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="mt-6 text-lg font-medium">Dataset Directory</h3>
                <p className="mt-2 text-muted-foreground">
                  The system maintains a directory of student face images used for building and updating the face
                  recognition database. Images should follow the naming convention:
                </p>
                <pre className="mt-2 rounded-md bg-muted p-2 font-mono text-sm">StudentID_FullName.jpg</pre>
                <p className="mt-2 text-muted-foreground">
                  For example: <code>USN123_John_Doe.jpg</code>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition">
          <Card>
            <CardHeader>
              <CardTitle>Face Recognition</CardTitle>
              <CardDescription>Understanding the face recognition technology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="text-lg font-medium">How Face Recognition Works</h3>
                <p className="mt-2 text-muted-foreground">
                  The system uses a combination of OpenCV and the face_recognition library to detect and recognize
                  faces. The process involves several steps:
                </p>
                <ol className="mt-2 list-inside list-decimal space-y-2 text-muted-foreground">
                  <li>
                    <strong>Face Detection:</strong> Identifying the location of faces in an image
                  </li>
                  <li>
                    <strong>Face Encoding:</strong> Converting each face into a 128-dimensional vector
                  </li>
                  <li>
                    <strong>Face Comparison:</strong> Comparing face encodings to find matches
                  </li>
                  <li>
                    <strong>Identity Verification:</strong> Determining the identity of recognized faces
                  </li>
                </ol>

                <h3 className="mt-6 text-lg font-medium">Tolerance Parameter</h3>
                <p className="mt-2 text-muted-foreground">
                  The system uses a tolerance parameter to determine how strict the face recognition should be:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <strong>Lower tolerance (e.g., 0.4):</strong> More strict matching, fewer false positives
                  </li>
                  <li>
                    <strong>Higher tolerance (e.g., 0.6):</strong> More lenient matching, fewer false negatives
                  </li>
                </ul>
                <p className="mt-2 text-muted-foreground">
                  The default tolerance is set to 0.5, which provides a good balance for most scenarios.
                </p>

                <h3 className="mt-6 text-lg font-medium">Best Practices for Accuracy</h3>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>Use clear, well-lit frontal face images for the dataset</li>
                  <li>Ensure good lighting conditions during recognition</li>
                  <li>Maintain a reasonable distance from the camera</li>
                  <li>Update the dataset periodically with new images</li>
                  <li>Adjust the tolerance parameter based on your specific needs</li>
                </ul>

                <h3 className="mt-6 text-lg font-medium">Performance Considerations</h3>
                <p className="mt-2 text-muted-foreground">
                  Face recognition can be computationally intensive. Consider these factors:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>Processing time increases with the number of faces in the database</li>
                  <li>Higher resolution images require more processing power</li>
                  <li>Real-time recognition may be slower on less powerful hardware</li>
                  <li>The system is optimized for classroom-sized groups (up to 50 students)</li>
                </ul>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
