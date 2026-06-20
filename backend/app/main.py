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
    student_subjects
)

app = FastAPI(
    title="Attendance Tracker API",
    version="1.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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



@app.get("/")
def root():
    return {
        "message": "Attendance Tracker API Running"
    }