from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.schemas.subject_staff import SubjectStaffCreate, SubjectStaffUpdate, SubjectStaffResponse
from app.services.subject_staff_service import SubjectStaffService

router = APIRouter(
    tags=["Subject Staff Mapping"]
)


@router.post(
    "/api/subject-staff",
    response_model=SubjectStaffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a staff member to a subject"
)
async def assign_staff(
    mapping: SubjectStaffCreate,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.assign_staff(db, mapping)


@router.get(
    "/api/subjects/{subject_id}/staff",
    response_model=List[SubjectStaffResponse],
    summary="Get all staff assignments for a subject"
)
async def list_staff_by_subject(
    subject_id: UUID,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.get_staff_by_subject(db, subject_id)


@router.put(
    "/api/subject-staff/{mapping_id}",
    response_model=SubjectStaffResponse,
    summary="Update staff assignment detail"
)
async def update_mapping(
    mapping_id: UUID,
    mapping: SubjectStaffUpdate,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.update_mapping(db, mapping_id, mapping)


@router.delete(
    "/api/subject-staff/{mapping_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete staff assignment"
)
async def delete_mapping(
    mapping_id: UUID,
    db: Session = Depends(get_db)
):
    SubjectStaffService.delete_mapping(db, mapping_id)
    return None
