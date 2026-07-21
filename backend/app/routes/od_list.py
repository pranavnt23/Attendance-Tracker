from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import require_attendance_rep
from app.schemas.od_list import (
    ODListCreate,
    ODListBulkCreate,
    ODListBulkDelete,
    ODListBulkResponse,
    ODListItemResponse,
    ODListResponse
)
from app.services.od_list_service import ODListService

router = APIRouter(
    prefix="/api/od-list",
    tags=["OD List"]
)


@router.post(
    "",
    response_model=ODListResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a student to the OD list (Attendance Rep only)"
)
async def add_student_to_od_list(
    payload: ODListCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ODListService.add_student(db, payload.student_id, current_rep)


@router.post(
    "/bulk-add",
    response_model=ODListBulkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bulk add multiple students to the OD list (Attendance Rep only)"
)
async def bulk_add_students_to_od_list(
    payload: ODListBulkCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ODListService.bulk_add_students(db, payload.student_ids, current_rep)


@router.post(
    "/bulk-delete",
    response_model=ODListBulkResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk remove multiple students from the OD list (Attendance Rep only)"
)
async def bulk_remove_students_from_od_list(
    payload: ODListBulkDelete,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ODListService.bulk_remove_students(db, payload.student_ids, current_rep)


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_200_OK,
    summary="Remove a student from the OD list (Attendance Rep only)"
)
async def remove_student_from_od_list(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    ODListService.remove_student(db, student_id, current_rep)
    return {"message": "Student removed from OD list successfully."}


@router.get(
    "/search",
    response_model=List[ODListItemResponse],
    summary="Search students in representative's class (Attendance Rep only)"
)
async def search_od_list(
    query: Optional[str] = Query(None, description="Search by register_no or student_name"),
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ODListService.search_od_list(db, query, current_rep)


@router.get(
    "",
    response_model=List[ODListItemResponse],
    summary="Get complete OD list for representative's class (Attendance Rep only)"
)
async def get_complete_od_list(
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return ODListService.get_od_list(db, current_rep)
