from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from datetime import date
from typing import List, Dict, Any

from app.database.models import AttendanceSession, Attendance, Student, Subject, Slot, Timetable, StudentSubject, Staff
from app.schemas.attendance import (
    AttendanceSessionCreate,
    SessionStudentResponse,
    AttendanceMarkRequest,
    SessionAttendanceViewResponse,
    AttendanceRecordView,
    AttendanceRecordUpdate,
    SubjectSubstitutionRequest,
    SessionDetailsResponse
)
from app.services.class_service import ClassService
from app.services.slot_service import SlotService
from app.services.subject_service import SubjectService
from app.services.staff_service import StaffService


class AttendanceService:
    @staticmethod
    def get_session(db: Session, session_id: UUID) -> AttendanceSession:
        session = db.query(AttendanceSession).filter(
            AttendanceSession.session_id == session_id
        ).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance session with ID '{session_id}' not found."
            )
        return session

    @staticmethod
    def create_session(
        db: Session,
        session_in: AttendanceSessionCreate,
        creator_id: UUID
    ) -> AttendanceSession:
        # Validate foreign keys
        ClassService.get(db, session_in.class_id)
        SlotService.get(db, session_in.slot_id)
        StaffService.get(db, session_in.staff_id)
        subject = SubjectService.get(db, session_in.subject_id)

        # Validate subject belongs to class
        if subject.class_id != session_in.class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The specified subject does not belong to this class."
            )

        # Prevent duplicate sessions (unique class_id, session_date, slot_id, subject_id)
        existing = db.query(AttendanceSession).filter(
            AttendanceSession.class_id == session_in.class_id,
            AttendanceSession.session_date == session_in.session_date,
            AttendanceSession.slot_id == session_in.slot_id,
            AttendanceSession.subject_id == session_in.subject_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An attendance session already exists for this class, date, slot, and subject."
            )

        db_session = AttendanceSession(
            class_id=session_in.class_id,
            session_date=session_in.session_date,
            slot_id=session_in.slot_id,
            subject_id=session_in.subject_id,
            staff_id=session_in.staff_id,
            created_by_student_id=creator_id,
            remarks=session_in.remarks
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session

    @staticmethod
    def get_students_for_session(
        db: Session,
        session_id: UUID
    ) -> List[SessionStudentResponse]:
        session = AttendanceService.get_session(db, session_id)
        subject = db.query(Subject).filter(Subject.subject_id == session.subject_id).first()

        if subject and subject.subject_type in ["Elective Theory", "Elective Lab"]:
            students = db.query(Student).join(
                StudentSubject, Student.student_id == StudentSubject.student_id
            ).filter(
                StudentSubject.subject_id == subject.subject_id
            ).order_by(Student.register_no).all()
        else:
            # Fetch all students in the class
            students = db.query(Student).filter(
                Student.class_id == session.class_id
            ).order_by(Student.register_no).all()

        # Build list with default 'P' status
        return [
            SessionStudentResponse(
                student_id=s.student_id,
                register_no=s.register_no,
                student_name=s.student_name,
                status="P"
            )
            for s in students
        ]

    @staticmethod
    def mark_attendance(
        db: Session,
        request: AttendanceMarkRequest
    ) -> None:
        session = AttendanceService.get_session(db, request.session_id)
        subject = db.query(Subject).filter(Subject.subject_id == session.subject_id).first()

        if subject and subject.subject_type in ["Elective Theory", "Elective Lab"]:
            students = db.query(Student).join(
                StudentSubject, Student.student_id == StudentSubject.student_id
            ).filter(
                StudentSubject.subject_id == subject.subject_id
            ).order_by(Student.register_no).all()
            error_detail = "is not mapped to this elective subject."
        else:
            students = db.query(Student).filter(
                Student.class_id == session.class_id
            ).order_by(Student.register_no).all()
            error_detail = "does not belong to this class."

        student_ids = {s.student_id for s in students}

        # Validate that absentees and OD students belong to this set
        for abs_id in request.absentees:
            if abs_id not in student_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Student ID '{abs_id}' {error_detail}"
                )

        for od in request.od_students:
            if od.student_id not in student_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Student ID '{od.student_id}' {error_detail}"
                )

        # Remove existing attendance entries for this session (for idempotency)
        db.query(Attendance).filter(
            Attendance.session_id == request.session_id
        ).delete()

        absentees_set = set(request.absentees)
        od_map = {od.student_id: od.od_reason for od in request.od_students}

        # Record attendance
        for s in students:
            status_val = "P"
            od_reason_val = None

            if s.student_id in absentees_set:
                status_val = "A"
            elif s.student_id in od_map:
                status_val = "OD"
                od_reason_val = od_map[s.student_id]

            db_record = Attendance(
                session_id=request.session_id,
                student_id=s.student_id,
                status=status_val,
                od_reason=od_reason_val
            )
            db.add(db_record)

        db.commit()

    @staticmethod
    def view_attendance(
        db: Session,
        session_id: UUID
    ) -> SessionAttendanceViewResponse:
        session = AttendanceService.get_session(db, session_id)
        subject = db.query(Subject).filter(Subject.subject_id == session.subject_id).first()
        slot = db.query(Slot).filter(Slot.slot_id == session.slot_id).first()

        records = db.query(Attendance).filter(
            Attendance.session_id == session_id
        ).all()

        attendance_list = []
        for r in records:
            stud = db.query(Student).filter(Student.student_id == r.student_id).first()
            attendance_list.append(AttendanceRecordView(
                student_name=stud.student_name if stud else "Unknown Student",
                status=r.status,
                od_reason=r.od_reason
            ))

        return SessionAttendanceViewResponse(
            session_id=session_id,
            subject_name=subject.subject_name if subject else "Unknown Subject",
            session_date=session.session_date,
            slot_no=slot.slot_no if slot else 0,
            attendance=attendance_list
        )

    @staticmethod
    def edit_attendance(
        db: Session,
        session_id: UUID,
        updates: List[AttendanceRecordUpdate]
    ) -> None:
        # Verify session exists
        AttendanceService.get_session(db, session_id)

        for up in updates:
            record = db.query(Attendance).filter(
                Attendance.session_id == session_id,
                Attendance.student_id == up.student_id
            ).first()

            if not record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Attendance record for student ID '{up.student_id}' not found in this session."
                )

            record.status = up.status
            record.od_reason = up.od_reason if up.status == "OD" else None

        db.commit()

    @staticmethod
    def update_session_subject(
        db: Session,
        session_id: UUID,
        sub_in: SubjectSubstitutionRequest
    ) -> AttendanceSession:
        db_session = AttendanceService.get_session(db, session_id)

        # Verify new subject exists
        new_subject = SubjectService.get(db, sub_in.subject_id)

        # Subject must belong to class
        if new_subject.class_id != db_session.class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New subject does not belong to the class of this session."
            )

        db_session.subject_id = sub_in.subject_id
        if sub_in.remarks:
            db_session.remarks = sub_in.remarks

        # If the subject changed, check if we need to remove attendance records for students who are no longer eligible
        if new_subject.subject_type in ["Elective Theory", "Elective Lab"]:
            eligible_student_ids = {
                s[0] for s in db.query(StudentSubject.student_id).filter(
                    StudentSubject.subject_id == new_subject.subject_id
                ).all()
            }
            db.query(Attendance).filter(
                Attendance.session_id == session_id,
                ~Attendance.student_id.in_(eligible_student_ids)
            ).delete(synchronize_session=False)

        db.commit()
        db.refresh(db_session)
        return db_session

    @staticmethod
    def get_session_details(
        db: Session,
        session_id: UUID
    ) -> SessionDetailsResponse:
        session = AttendanceService.get_session(db, session_id)

        # 1. Determine planned subject name from timetable using (class, day_of_week, slot_id)
        # session_date.isoweekday() returns 1 (Monday) to 7 (Sunday)
        day_of_week = session.session_date.isoweekday()

        # Try to find a planned entry matching the conducted subject first (parallel slots support)
        timetable_entry = db.query(Timetable).filter(
            Timetable.class_id == session.class_id,
            Timetable.day_of_week == day_of_week,
            Timetable.slot_id == session.slot_id,
            Timetable.subject_id == session.subject_id
        ).first()

        # If not found, try to find any timetable entry in this slot
        if not timetable_entry:
            timetable_entry = db.query(Timetable).filter(
                Timetable.class_id == session.class_id,
                Timetable.day_of_week == day_of_week,
                Timetable.slot_id == session.slot_id
            ).first()

        planned_subject_name = "No Planned Class"
        if timetable_entry:
            planned_sub = db.query(Subject).filter(Subject.subject_id == timetable_entry.subject_id).first()
            if planned_sub:
                planned_subject_name = planned_sub.subject_name

        # 2. Get conducted subject
        conducted_sub = db.query(Subject).filter(Subject.subject_id == session.subject_id).first()
        conducted_subject_name = conducted_sub.subject_name if conducted_sub else "Unknown"

        # 3. Get slot number
        slot = db.query(Slot).filter(Slot.slot_id == session.slot_id).first()
        slot_no = slot.slot_no if slot else 0

        return SessionDetailsResponse(
            session_date=session.session_date,
            slot_no=slot_no,
            planned_subject=planned_subject_name,
            conducted_subject=conducted_subject_name,
            remarks=session.remarks
        )

    @staticmethod
    def list_sessions(db: Session, class_id: UUID) -> List[Dict[str, Any]]:
        from sqlalchemy import func

        # Subquery to count present students for each session
        attendance_subquery = db.query(
            Attendance.session_id,
            func.count(Attendance.attendance_id).label("present_count")
        ).filter(
            Attendance.status == "P"
        ).group_by(
            Attendance.session_id
        ).subquery()

        # Query all sessions for this class with slot, subject, staff details and present count
        query_results = db.query(
            AttendanceSession.session_id,
            AttendanceSession.class_id,
            AttendanceSession.session_date,
            AttendanceSession.slot_id,
            AttendanceSession.subject_id,
            AttendanceSession.staff_id,
            AttendanceSession.remarks,
            AttendanceSession.created_at,
            Slot.slot_no,
            Subject.subject_name,
            Subject.subject_code,
            Staff.staff_name,
            func.coalesce(attendance_subquery.c.present_count, 0).label("attendance_count")
        ).join(
            Slot, AttendanceSession.slot_id == Slot.slot_id
        ).join(
            Subject, AttendanceSession.subject_id == Subject.subject_id
        ).join(
            Staff, AttendanceSession.staff_id == Staff.staff_id
        ).outerjoin(
            attendance_subquery, AttendanceSession.session_id == attendance_subquery.c.session_id
        ).filter(
            AttendanceSession.class_id == class_id
        ).order_by(
            AttendanceSession.session_date.desc(),
            AttendanceSession.created_at.desc()
        ).all()

        return [
            {
                "session_id": r.session_id,
                "class_id": r.class_id,
                "session_date": r.session_date,
                "slot_id": r.slot_id,
                "slot_no": r.slot_no,
                "subject_id": r.subject_id,
                "subject_name": r.subject_name,
                "subject_code": r.subject_code,
                "staff_id": r.staff_id,
                "faculty_name": r.staff_name,
                "attendance_count": r.attendance_count,
                "remarks": r.remarks,
                "created_at": r.created_at
            }
            for r in query_results
        ]

    @staticmethod
    def delete_session(db: Session, session_id: UUID, class_id: UUID) -> None:
        session = AttendanceService.get_session(db, session_id)
        if session.class_id != class_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete a session from another class."
            )
        db.delete(session)
        db.commit()
