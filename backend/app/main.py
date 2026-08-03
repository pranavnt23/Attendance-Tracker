from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth,
    students,
    attendance,
    timetable,
    colleges,
    departments,
    courses,
    batches,
    classes,
    staff,
    subjects,
    subject_staff,
    slots,
    reports,
    student_dashboard,
    student_subjects,
    od_list
)

app = FastAPI(
    title="Attendance Tracker API",
    version="1.0.0"
)

import os

# Configure CORS Middleware
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:3000",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(timetable.router)
app.include_router(colleges.router)
app.include_router(departments.router)
app.include_router(courses.router)
app.include_router(batches.router)
app.include_router(classes.router)
app.include_router(staff.router)
app.include_router(subjects.router)
app.include_router(subject_staff.router)
app.include_router(slots.router)
app.include_router(reports.router)
app.include_router(student_dashboard.router)
app.include_router(student_subjects.router)
app.include_router(od_list.router)




@app.get("/")
def root():
    return {
        "message": "Attendance Tracker API Running"
    }