from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.attendance import (
    AttendanceSessionCreate,
    AttendanceSessionResponse,
    SessionStudentResponse,
    AttendanceMarkRequest,
    SessionAttendanceViewResponse,
    AttendanceRecordUpdate,
    SubjectSubstitutionRequest,
    SessionDetailsResponse,
    SessionLogResponse
)
from app.services.attendance_service import AttendanceService

router = APIRouter(
    prefix="/api/attendance",
    tags=["Attendance"]
)


@router.post(
    "/session",
    response_model=AttendanceSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new attendance session (Attendance Rep only)"
)
async def create_session(
    session: AttendanceSessionCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return AttendanceService.create_session(db, session, current_rep.student_id)


@router.get(
    "/session/{session_id}/students",
    response_model=List[SessionStudentResponse],
    summary="Get all students in the class for the session (default 'P' status)"
)
async def get_students_for_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return AttendanceService.get_students_for_session(db, session_id)


@router.post(
    "/mark",
    status_code=status.HTTP_200_OK,
    summary="Mark attendance for a session (Attendance Rep only)"
)
async def mark_attendance(
    request: AttendanceMarkRequest,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    AttendanceService.mark_attendance(db, request)
    return {"message": "Attendance marked successfully."}


@router.get(
    "/session/{session_id}",
    response_model=SessionAttendanceViewResponse,
    summary="View attendance recorded for a session"
)
async def view_attendance(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return AttendanceService.view_attendance(db, session_id)


@router.put(
    "/session/{session_id}",
    status_code=status.HTTP_200_OK,
    summary="Edit attendance records for a session (Attendance Rep only)"
)
async def edit_attendance(
    session_id: UUID,
    updates: List[AttendanceRecordUpdate],
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    AttendanceService.edit_attendance(db, session_id, updates)
    return {"message": "Attendance records updated successfully."}


@router.patch(
    "/session/{session_id}/subject",
    response_model=AttendanceSessionResponse,
    summary="Substitute session subject (Attendance Rep only)"
)
async def substitute_subject(
    session_id: UUID,
    sub: SubjectSubstitutionRequest,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return AttendanceService.update_session_subject(db, session_id, sub)


@router.get(
    "/session/{session_id}/details",
    response_model=SessionDetailsResponse,
    summary="Get session details (planned vs conducted subjects)"
)
async def get_session_details(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return AttendanceService.get_session_details(db, session_id)


@router.get(
    "/sessions",
    response_model=List[SessionLogResponse],
    summary="List all attendance sessions for the representative's class (Attendance Rep only)"
)
async def list_sessions(
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return AttendanceService.list_sessions(db, current_rep.class_id)


@router.delete(
    "/session/{session_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an attendance session (Attendance Rep only)"
)
async def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    AttendanceService.delete_session(db, session_id, current_rep.class_id)
    return {"message": "Session deleted successfully."}