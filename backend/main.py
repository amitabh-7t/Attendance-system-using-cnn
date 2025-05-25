from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional
import cv2
import numpy as np
import pickle
import os
import yaml
import base64
from datetime import datetime, date
import sqlite3
import uvicorn
from pydantic import BaseModel
import time
import asyncio

# Import utility functions
from utils import (
    recognize, 
    get_databse, 
    submitNew, 
    get_info_from_id, 
    deleteOne, 
    build_dataset, 
    isFaceExists
)

# Load config
cfg = yaml.load(open('config.yaml', 'r'), Loader=yaml.FullLoader)
PKL_PATH = cfg['PATH']['PKL_PATH']
DB_PATH = cfg['PATH'].get('DB_PATH', 'attendance.db')

app = FastAPI(
    title="Face Recognition Attendance System",
    description="API for face recognition attendance system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database if it doesn't exist
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'present'
    )
    ''')
    conn.commit()
    conn.close()

init_db()

# Models
class Student(BaseModel):
    id: str
    name: str
    image: Optional[str] = None

class AttendanceRecord(BaseModel):
    student_id: str
    student_name: str
    timestamp: str
    status: str

# Helper functions
def log_attendance(student_id, student_name, status="present"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO attendance (student_id, student_name, status) VALUES (?, ?, ?)",
        (student_id, student_name, status)
    )
    conn.commit()
    conn.close()

def get_attendance_logs(start_date=None, end_date=None, student_id=None, status=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = "SELECT * FROM attendance"
    conditions = []
    params = []
    
    if start_date:
        conditions.append("DATE(timestamp) >= ?")
        params.append(start_date)
    
    if end_date:
        conditions.append("DATE(timestamp) <= ?")
        params.append(end_date)
    
    if student_id:
        conditions.append("student_id = ?")
        params.append(student_id)
    
    if status:
        conditions.append("status = ?")
        params.append(status)
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY timestamp DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "student_id": row[1],
            "student_name": row[2],
            "timestamp": row[3],
            "status": row[4]
        })
    
    return result

def encode_image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')

def decode_base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    image_bytes = base64.b64decode(base64_string)
    np_array = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(np_array, cv2.IMREAD_COLOR)

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Face Recognition Attendance System API"}

@app.get("/students")
async def get_students():
    """Get all students in the database"""
    database = get_databse()
    students = []
    
    for idx, person in database.items():
        students.append({
            "idx": idx,
            "id": person['id'],
            "name": person['name'],
            "image": encode_image_to_base64(person['image'])
        })
    
    return students

@app.get("/students/{student_id}")
async def get_student(student_id: str):
    """Get student by ID"""
    name, image, idx = get_info_from_id(student_id)
    
    if name is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {
        "idx": idx,
        "id": student_id,
        "name": name,
        "image": encode_image_to_base64(image)
    }

@app.post("/students")
async def add_student(name: str = Form(...), student_id: str = Form(...), image: UploadFile = File(...)):
    """Add a new student to the database"""
    contents = await image.read()
    np_array = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    result = submitNew(name, student_id, img)
    
    if result == -1:
        raise HTTPException(status_code=400, detail="No face detected in the image")
    elif result == 0:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    return {"message": "Student added successfully"}

@app.post("/students/base64")
async def add_student_base64(student: Student):
    """Add a new student to the database using base64 image"""
    if not student.image:
        raise HTTPException(status_code=400, detail="Image is required")
    
    img = decode_base64_to_image(student.image)
    result = submitNew(student.name, student.id, img)
    
    if result == -1:
        raise HTTPException(status_code=400, detail="No face detected in the image")
    elif result == 0:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    return {"message": "Student added successfully"}

@app.put("/students/{student_id}")
async def update_student(
    student_id: str,
    name: Optional[str] = Form(None),
    new_id: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Update student information"""
    old_name, old_image, old_idx = get_info_from_id(student_id)
    
    if old_name is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_name = name if name else old_name
    update_id = new_id if new_id else student_id
    
    if image:
        contents = await image.read()
        np_array = np.frombuffer(contents, np.uint8)
        update_image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    else:
        update_image = old_image
    
    result = submitNew(update_name, update_id, update_image, old_idx=old_idx)
    
    if result == -1:
        raise HTTPException(status_code=400, detail="No face detected in the image")
    elif result == 0:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    return {"message": "Student updated successfully"}

@app.delete("/students/{student_id}")
async def delete_student(student_id: str):
    """Delete a student from the database"""
    name, _, _ = get_info_from_id(student_id)
    
    if name is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    deleteOne(student_id)
    return {"message": "Student deleted successfully"}

@app.post("/recognize")
async def recognize_face(image: UploadFile = File(...), tolerance: float = 0.5):
    """Recognize face in an image"""
    contents = await image.read()
    np_array = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    result_img, name, student_id = recognize(img, tolerance)
    
    if name != "Unknown" and student_id != "Unknown":
        # Log attendance in background
        log_attendance(student_id, name)
    
    return {
        "name": name,
        "id": student_id,
        "image": encode_image_to_base64(result_img)
    }

@app.post("/recognize/base64")
async def recognize_face_base64(data: dict):
    """Recognize face in a base64 encoded image"""
    if "image" not in data:
        raise HTTPException(status_code=400, detail="Image is required")
    
    tolerance = data.get("tolerance", 0.5)
    img = decode_base64_to_image(data["image"])
    
    result_img, name, student_id = recognize(img, tolerance)
    
    if name != "Unknown" and student_id != "Unknown":
        # Log attendance
        log_attendance(student_id, name)
    
    return {
        "name": name,
        "id": student_id,
        "image": encode_image_to_base64(result_img)
    }

@app.get("/attendance")
async def get_attendance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    student_id: Optional[str] = None,
    status: Optional[str] = None
):
    """Get attendance logs with optional filters"""
    logs = get_attendance_logs(start_date, end_date, student_id, status)
    return logs

@app.post("/attendance")
async def mark_attendance(record: AttendanceRecord):
    """Manually mark attendance"""
    log_attendance(record.student_id, record.student_name, record.status)
    return {"message": "Attendance recorded successfully"}

@app.post("/dataset/rebuild")
async def rebuild_dataset(background_tasks: BackgroundTasks):
    """Rebuild the dataset from images"""
    background_tasks.add_task(build_dataset)
    return {"message": "Dataset rebuild started in background"}

# Webcam stream endpoint
async def generate_frames(tolerance: float = 0.5):
    """Generate frames from webcam with face recognition"""
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        raise HTTPException(status_code=500, detail="Could not open webcam")
    
    try:
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            # Process frame for face recognition
            result_img, name, student_id = recognize(frame, tolerance)
            
            if name != "Unknown" and student_id != "Unknown":
                # Log attendance (but not too frequently for the same person)
                # This would need a more sophisticated approach in production
                pass
            
            # Encode frame to JPEG
            _, buffer = cv2.imencode('.jpg', result_img)
            frame_bytes = buffer.tobytes()
            
            # Yield frame for streaming
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
            )
            
            # Add a small delay
            await asyncio.sleep(0.1)
    finally:
        cap.release()

@app.get("/webcam")
async def video_feed(tolerance: float = 0.5):
    """Stream webcam with face recognition"""
    return StreamingResponse(
        generate_frames(tolerance),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
