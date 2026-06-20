from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user
from app.schemas.reports import (
    ClassAttendanceReportResponse,
    SubjectAttendanceReportResponse,
    ShortageReportResponse
)
from app.services.report_service import ReportService

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports & Analytics"]
)


@router.get(
    "/class-attendance/{class_id}",
    response_model=ClassAttendanceReportResponse,
    summary="Get attendance summaries for all students in a class"
)
async def get_class_attendance_report(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return ReportService.get_class_attendance_report(db, class_id)


@router.get(
    "/subject-attendance/{subject_id}",
    response_model=SubjectAttendanceReportResponse,
    summary="Get attendance summaries for all students mapped to a subject"
)
async def get_subject_attendance_report(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return ReportService.get_subject_attendance_report(db, subject_id)


@router.get(
    "/shortage/{class_id}",
    response_model=ShortageReportResponse,
    summary="Get students below the minimum attendance threshold (Shortage list)"
)
async def get_shortage_report(
    class_id: UUID,
    threshold: float = Query(75.0, ge=0.0, le=100.0, description="Shortage threshold percentage (default 75.0%)"),
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return ReportService.get_shortage_report(db, class_id, threshold)
