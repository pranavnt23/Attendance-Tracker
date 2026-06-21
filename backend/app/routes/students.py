from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.students import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    RoleUpdate,
    BulkRegisterResponse
)
from app.services.student_service import StudentService
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import SubjectWiseAttendanceResponse, AttendanceHistoryResponse

router = APIRouter(
    tags=["Students"]
)


@router.post(
    "/api/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a single student (Attendance Rep only)"
)
async def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StudentService.create(db, student)


@router.post(
    "/api/students/bulk",
    response_model=BulkRegisterResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk register multiple students (Attendance Rep only)"
)
async def bulk_register_students(
    students: List[StudentCreate],
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StudentService.bulk_register(db, students)


@router.get(
    "/api/classes/{class_id}/students",
    response_model=List[StudentResponse],
    summary="Get all students belonging to a class"
)
async def list_students_by_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StudentService.list_by_class(db, class_id)


@router.get(
    "/api/students/{student_id}",
    response_model=StudentResponse,
    summary="Get a student by ID"
)
async def get_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StudentService.get(db, student_id)


@router.put(
    "/api/students/{student_id}",
    response_model=StudentResponse,
    summary="Update a student by ID (Attendance Rep only)"
)
async def update_student(
    student_id: UUID,
    student: StudentUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StudentService.update(db, student_id, student)


@router.patch(
    "/api/students/{student_id}/role",
    response_model=StudentResponse,
    summary="Update a student's role (Attendance Rep only)"
)
async def patch_student_role(
    student_id: UUID,
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StudentService.patch_role(db, student_id, role_update)


@router.delete(
    "/api/students/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a student by ID (Attendance Rep only)"
)
async def delete_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    StudentService.delete(db, student_id)
    return None


@router.get(
    "/api/rep/students/{student_id}/attendance/subject-wise",
    response_model=List[SubjectWiseAttendanceResponse],
    summary="Get a student's subject-wise attendance (Attendance Rep only)"
)
async def get_rep_student_subject_wise(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return DashboardService.get_subject_wise_attendance(db, student_id)


@router.get(
    "/api/rep/students/{student_id}/attendance/history",
    response_model=List[AttendanceHistoryResponse],
    summary="Get a student's attendance history logs (Attendance Rep only)"
)
async def get_rep_student_history(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return DashboardService.get_attendance_history(db, student_id)