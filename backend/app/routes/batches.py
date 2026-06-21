from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.batches import BatchCreate, BatchUpdate, BatchResponse
from app.services.batch_service import BatchService

router = APIRouter(
    tags=["Batches"]
)


@router.post(
    "/api/batches",
    response_model=BatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new batch (Attendance Rep only)"
)
async def create_batch(
    batch: BatchCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return BatchService.create(db, batch)


@router.get(
    "/api/courses/{course_id}/batches",
    response_model=List[BatchResponse],
    summary="Get all batches belonging to a course"
)
async def list_batches_by_course(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return BatchService.list_by_course(db, course_id)


@router.get(
    "/api/batches/{batch_id}",
    response_model=BatchResponse,
    summary="Get a single batch by ID"
)
async def get_batch(
    batch_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return BatchService.get(db, batch_id)


@router.put(
    "/api/batches/{batch_id}",
    response_model=BatchResponse,
    summary="Update a batch by ID (Attendance Rep only)"
)
async def update_batch(
    batch_id: UUID,
    batch: BatchUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return BatchService.update(db, batch_id, batch)


@router.delete(
    "/api/batches/{batch_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a batch by ID (Attendance Rep only)"
)
async def delete_batch(
    batch_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    BatchService.delete(db, batch_id)
    return None
