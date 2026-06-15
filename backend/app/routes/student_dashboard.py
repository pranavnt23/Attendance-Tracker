from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user
from app.schemas.dashboard import (
    StudentProfileResponse,
    OverallAttendanceResponse,
    SubjectWiseAttendanceResponse,
    AttendanceHistoryResponse,
    StaticTimetableResponse,
    ActualTimetableSlot,
    SubjectDetailsResponse
)
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/api/student",
    tags=["Student Dashboard"]
)


@router.get(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Get current student profile details"
)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_profile(db, current_user.student_id)


@router.get(
    "/attendance/overall",
    response_model=OverallAttendanceResponse,
    summary="Get overall student attendance calculations"
)
async def get_overall_attendance(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_overall_attendance(db, current_user.student_id)


@router.get(
    "/attendance/subject-wise",
    response_model=List[SubjectWiseAttendanceResponse],
    summary="Get student attendance broken down subject-wise"
)
async def get_subject_wise_attendance(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_subject_wise_attendance(db, current_user.student_id)


@router.get(
    "/attendance/history",
    response_model=List[AttendanceHistoryResponse],
    summary="Get complete session logs attended by student"
)
async def get_attendance_history(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_attendance_history(db, current_user.student_id)


@router.get(
    "/timetable/static",
    response_model=StaticTimetableResponse,
    summary="Get static weekly class timetable"
)
async def get_static_timetable(
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_static_timetable(db, current_user.student_id)


@router.get(
    "/timetable/actual",
    response_model=List[ActualTimetableSlot],
    summary="Get actual class schedule for a specific date (combines substitutions and marked status)"
)
async def get_actual_timetable(
    date: date = Query(..., description="Query date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_actual_timetable(db, current_user.student_id, date)


@router.get(
    "/subjects/{subject_id}",
    response_model=SubjectDetailsResponse,
    summary="Get detailed attendance information for a specific subject"
)
async def get_subject_details(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return DashboardService.get_subject_details(db, current_user.student_id, subject_id)
