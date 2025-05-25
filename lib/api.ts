import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Student API
export const getStudents = async () => {
  const response = await api.get("/students")
  return response.data
}

export const getStudent = async (id: string) => {
  const response = await api.get(`/students/${id}`)
  return response.data
}

export const addStudent = async (formData: FormData) => {
  const response = await api.post("/students", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const addStudentBase64 = async (student: { name: string; id: string; image: string }) => {
  const response = await api.post("/students/base64", student)
  return response.data
}

export const updateStudent = async (id: string, formData: FormData) => {
  const response = await api.put(`/students/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/students/${id}`)
  return response.data
}

// Recognition API
export const recognizeFace = async (formData: FormData) => {
  const response = await api.post("/recognize", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const recognizeFaceBase64 = async (imageData: string, tolerance = 0.5) => {
  const response = await api.post("/recognize/base64", {
    image: imageData,
    tolerance,
  })
  return response.data
}

// Attendance API
export const getAttendance = async (filters?: {
  start_date?: string
  end_date?: string
  student_id?: string
  status?: string
}) => {
  const response = await api.get("/attendance", { params: filters })
  return response.data
}

export const markAttendance = async (record: {
  student_id: string
  student_name: string
  timestamp: string
  status: string
}) => {
  const response = await api.post("/attendance", record)
  return response.data
}

// Dataset API
export const rebuildDataset = async () => {
  const response = await api.post("/dataset/rebuild")
  return response.data
}

export default api
