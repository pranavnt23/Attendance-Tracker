from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.colleges import CollegeCreate, CollegeUpdate, CollegeResponse
from app.services.college_service import CollegeService

router = APIRouter(
    prefix="/api/colleges",
    tags=["Colleges"]
)


@router.post(
    "/",
    response_model=CollegeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new college (Attendance Rep only)"
)
async def create_college(
    college: CollegeCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return CollegeService.create(db, college)


@router.get(
    "/",
    response_model=List[CollegeResponse],
    summary="Get all colleges"
)
async def list_colleges(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return CollegeService.list(db)


@router.get(
    "/{college_id}",
    response_model=CollegeResponse,
    summary="Get a single college by ID"
)
async def get_college(
    college_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return CollegeService.get(db, college_id)


@router.put(
    "/{college_id}",
    response_model=CollegeResponse,
    summary="Update a college by ID (Attendance Rep only)"
)
async def update_college(
    college_id: UUID,
    college: CollegeUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return CollegeService.update(db, college_id, college)


@router.delete(
    "/{college_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a college by ID (Attendance Rep only)"
)
async def delete_college(
    college_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    CollegeService.delete(db, college_id)
    return None
