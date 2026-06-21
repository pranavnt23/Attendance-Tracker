from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from app.services.staff_service import StaffService

router = APIRouter(
    tags=["Staff"]
)


@router.post(
    "/api/staff",
    response_model=StaffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new staff member (Attendance Rep only)"
)
async def create_staff(
    staff: StaffCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StaffService.create(db, staff)


@router.get(
    "/api/staff",
    response_model=List[StaffResponse],
    summary="Get all staff members"
)
async def list_staff(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StaffService.list(db)


@router.get(
    "/api/staff/{staff_id}",
    response_model=StaffResponse,
    summary="Get a staff member by ID"
)
async def get_staff(
    staff_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StaffService.get(db, staff_id)


@router.put(
    "/api/staff/{staff_id}",
    response_model=StaffResponse,
    summary="Update a staff member by ID (Attendance Rep only)"
)
async def update_staff(
    staff_id: UUID,
    staff: StaffUpdate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StaffService.update(db, staff_id, staff)


@router.delete(
    "/api/staff/{staff_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a staff member by ID (Attendance Rep only)"
)
async def delete_staff(
    staff_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    StaffService.delete(db, staff_id)
    return None
