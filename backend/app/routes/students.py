from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.schemas.students import (
    StudentCreate,
    StudentUpdate,
    StudentResponse,
    RoleUpdate,
    BulkRegisterResponse
)
from app.services.student_service import StudentService

router = APIRouter(
    tags=["Students"]
)


@router.post(
    "/api/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a single student"
)
async def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):
    return StudentService.create(db, student)


@router.post(
    "/api/students/bulk",
    response_model=BulkRegisterResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk register multiple students (skips duplicates)"
)
async def bulk_register_students(
    students: List[StudentCreate],
    db: Session = Depends(get_db)
):
    return StudentService.bulk_register(db, students)


@router.get(
    "/api/classes/{class_id}/students",
    response_model=List[StudentResponse],
    summary="Get all students belonging to a class"
)
async def list_students_by_class(
    class_id: UUID,
    db: Session = Depends(get_db)
):
    return StudentService.list_by_class(db, class_id)


@router.get(
    "/api/students/{student_id}",
    response_model=StudentResponse,
    summary="Get a student by ID"
)
async def get_student(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    return StudentService.get(db, student_id)


@router.put(
    "/api/students/{student_id}",
    response_model=StudentResponse,
    summary="Update a student by ID"
)
async def update_student(
    student_id: UUID,
    student: StudentUpdate,
    db: Session = Depends(get_db)
):
    return StudentService.update(db, student_id, student)


@router.patch(
    "/api/students/{student_id}/role",
    response_model=StudentResponse,
    summary="Update a student's role"
)
async def patch_student_role(
    student_id: UUID,
    role_update: RoleUpdate,
    db: Session = Depends(get_db)
):
    return StudentService.patch_role(db, student_id, role_update)


@router.delete(
    "/api/students/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a student by ID"
)
async def delete_student(
    student_id: UUID,
    db: Session = Depends(get_db)
):
    StudentService.delete(db, student_id)
    return None