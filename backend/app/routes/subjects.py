from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.subjects import SubjectCreate, SubjectUpdate, SubjectResponse
from app.services.subject_service import SubjectService

router = APIRouter(
    tags=["Subjects"]
)


@router.post(
    "/api/subjects",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new subject (Attendance Rep only)"
)
async def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return SubjectService.create(db, subject)


@router.get(
    "/api/classes/{class_id}/subjects",
    response_model=List[SubjectResponse],
    summary="Get all subjects belonging to a class"
)
async def list_subjects_by_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return SubjectService.list_by_class(db, class_id)


@router.get(
    "/api/subjects/{subject_id}",
    response_model=SubjectResponse,
    summary="Get a subject by ID"
)
async def get_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return SubjectService.get(db, subject_id)


@router.put(
    "/api/subjects/{subject_id}",
    response_model=SubjectResponse,
    summary="Update a subject by ID (Attendance Rep only)"
)
async def update_subject(
    subject_id: UUID,
    subject: SubjectUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return SubjectService.update(db, subject_id, subject)


@router.delete(
    "/api/subjects/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subject by ID (Attendance Rep only)"
)
async def delete_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    SubjectService.delete(db, subject_id)
    return None
