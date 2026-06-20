from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any

from app.database.db import get_db
from app.schemas.timetable import TimetableCreate, TimetableResponse
from app.services.timetable_service import TimetableService

router = APIRouter(
    tags=["Timetable"]
)


@router.post(
    "/api/timetable",
    response_model=TimetableResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new timetable entry"
)
async def create_timetable_entry(
    entry: TimetableCreate,
    db: Session = Depends(get_db)
):
    return TimetableService.add_entry(db, entry)


@router.post(
    "/api/timetable/bulk",
    response_model=List[TimetableResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Bulk upload timetable entries (atomic transaction)"
)
async def bulk_upload_timetable_entries(
    entries: List[TimetableCreate],
    db: Session = Depends(get_db)
):
    return TimetableService.bulk_upload(db, entries)


@router.get(
    "/api/classes/{class_id}/timetable",
    response_model=Dict[str, Any],
    summary="Get complete class timetable grouped by day and slot"
)
async def get_class_timetable(
    class_id: UUID,
    db: Session = Depends(get_db)
):
    return TimetableService.get_timetable_by_class(db, class_id)


@router.delete(
    "/api/timetable/{timetable_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a single timetable entry"
)
async def delete_timetable_entry(
    timetable_id: UUID,
    db: Session = Depends(get_db)
):
    TimetableService.delete_entry(db, timetable_id)
    return None


@router.delete(
    "/api/classes/{class_id}/timetable",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete entire timetable for a class"
)
async def delete_complete_timetable(
    class_id: UUID,
    db: Session = Depends(get_db)
):
    TimetableService.delete_timetable_by_class(db, class_id)
    return None