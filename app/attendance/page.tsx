"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAttendance, getStudents } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { Search, Filter, X, FileSpreadsheet, Calendar, BookOpen, User, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    studentId: "",
    status: "",
    subject: "",
    search: "",
  })

  // Subject options
  const subjects = [
    { code: "AI", name: "Artificial Intelligence" },
    { code: "DAA", name: "Design & Analysis of Algorithms" },
    { code: "TOC", name: "Theory of Computation" },
    { code: "FSD", name: "Full Stack Development" },
    { code: "DBMS", name: "Database Management Systems" },
    { code: "TNT", name: "Techniques for Non-Tabular Data" },
    { code: "SEC", name: "Soft & Entrepreneurial Skills" },
    { code: "CTS", name: "Computational Thinking Skills" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceResponse, studentsResponse] = await Promise.all([getAttendance(), getStudents()])

        setAttendanceData(attendanceResponse)
        setFilteredData(attendanceResponse)
        setStudents(studentsResponse)
      } catch (error) {
        console.error("Error fetching attendance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, attendanceData])

  const applyFilters = () => {
    let filtered = [...attendanceData]

    if (filters.startDate) {
      filtered = filtered.filter((record) => new Date(record.timestamp) >= new Date(filters.startDate))
    }

    if (filters.endDate) {
      filtered = filtered.filter((record) => new Date(record.timestamp) <= new Date(filters.endDate + "T23:59:59"))
    }

    if (filters.studentId && filters.studentId !== "all") {
      filtered = filtered.filter((record) => record.student_id === filters.studentId)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((record) => record.status === filters.status)
    }

    if (filters.subject && filters.subject !== "all") {
      filtered = filtered.filter((record) => record.subject === filters.subject)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.student_name.toLowerCase().includes(searchTerm) ||
          record.student_id.toLowerCase().includes(searchTerm),
      )
    }

    setFilteredData(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      studentId: "",
      status: "",
      subject: "",
      search: "",
    })
  }

  const exportToCSV = () => {
    // Get current date and time for filename
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-")

    // Create headers with subject information
    const headers = ["ID", "Student ID", "Student Name", "Subject", "Date & Time", "Status"]
    const csvData = [
      headers.join(","),
      ...filteredData.map((record) =>
        [
          record.id,
          record.student_id,
          `"${record.student_name}"`, // Quote names to handle commas
          record.subject || "N/A",
          record.timestamp,
          record.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_export_${dateStr}_${timeStr}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
        <Button onClick={exportToCSV} disabled={filteredData.length === 0} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
          <CardDescription>Filter attendance records by date, student, subject, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student" className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Student
              </Label>
              <Select
                value={filters.studentId || "all"}
                onValueChange={(value) => handleFilterChange("studentId", value)}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Subject
              </Label>
              <Select value={filters.subject || "all"} onValueChange={(value) => handleFilterChange("subject", value)}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Status
              </Label>
              <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name or ID"
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
                {filters.search && (
                  <button className="absolute right-2 top-2.5" onClick={() => handleFilterChange("search", "")}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {attendanceData.length} records
            </div>
            {Object.values(filters).some((value) => value !== "") && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>View and manage attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{record.student_id}</TableCell>
                        <TableCell>{record.student_name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {record.subject || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(record.timestamp)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              record.status === "present"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : record.status === "absent"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No records found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
