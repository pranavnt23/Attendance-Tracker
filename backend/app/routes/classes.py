from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.classes import ClassCreate, ClassUpdate, ClassResponse, SemesterPromotion
from app.services.class_service import ClassService

router = APIRouter(
    tags=["Classes"]
)


@router.post(
    "/api/classes",
    response_model=ClassResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new class (Attendance Rep only)"
)
async def create_class(
    class_obj: ClassCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ClassService.create(db, class_obj)


@router.get(
    "/api/batches/{batch_id}/classes",
    response_model=List[ClassResponse],
    summary="Get all classes belonging to a batch"
)
async def list_classes_by_batch(
    batch_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return ClassService.list_by_batch(db, batch_id)


@router.get(
    "/api/classes/{class_id}",
    response_model=ClassResponse,
    summary="Get a single class by ID"
)
async def get_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return ClassService.get(db, class_id)


@router.put(
    "/api/classes/{class_id}",
    response_model=ClassResponse,
    summary="Update a class by ID (Attendance Rep only)"
)
async def update_class(
    class_id: UUID,
    class_obj: ClassUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ClassService.update(db, class_id, class_obj)


@router.patch(
    "/api/classes/{class_id}/semester",
    response_model=ClassResponse,
    summary="Promote/update class semester (Attendance Rep only)"
)
async def promote_class(
    class_id: UUID,
    promo: SemesterPromotion,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ClassService.promote_semester(db, class_id, promo)


@router.delete(
    "/api/classes/{class_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a class by ID (Attendance Rep only)"
)
async def delete_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    ClassService.delete(db, class_id)
    return None
