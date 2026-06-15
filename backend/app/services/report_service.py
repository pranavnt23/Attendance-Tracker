from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Student, Class, Subject, Attendance, AttendanceSession
from app.schemas.reports import (
    ClassAttendanceReportResponse,
    SubjectAttendanceReportResponse,
    ShortageReportResponse,
    StudentAttendanceSummary
)


class ReportService:
    @staticmethod
    def get_class_attendance_report(
        db: Session,
        class_id: UUID
    ) -> ClassAttendanceReportResponse:
        class_obj = db.query(Class).filter(Class.class_id == class_id).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Class with ID '{class_id}' not found."
            )

        students = db.query(Student).filter(
            Student.class_id == class_id
        ).order_by(Student.register_no).all()

        students_attendance = []
        for s in students:
            records = db.query(Attendance).filter(
                Attendance.student_id == s.student_id
            ).all()

            conducted = len(records)
            present = sum(1 for r in records if r.status == "P")
            absent = sum(1 for r in records if r.status == "A")
            od = sum(1 for r in records if r.status == "OD")

            percentage = 100.0
            if conducted > 0:
                percentage = round((present / conducted) * 100, 2)

            students_attendance.append(
                StudentAttendanceSummary(
                    student_id=s.student_id,
                    register_no=s.register_no,
                    student_name=s.student_name,
                    conducted_hours=conducted,
                    present_hours=present,
                    absent_hours=absent,
                    od_hours=od,
                    attendance_percentage=percentage
                )
            )

        return ClassAttendanceReportResponse(
            class_id=class_id,
            class_name=class_obj.class_name,
            students_attendance=students_attendance
        )

    @staticmethod
    def get_subject_attendance_report(
        db: Session,
        subject_id: UUID
    ) -> SubjectAttendanceReportResponse:
        subject = db.query(Subject).filter(Subject.subject_id == subject_id).first()
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID '{subject_id}' not found."
            )

        # Retrieve students in the class belonging to the subject
        students = db.query(Student).filter(
            Student.class_id == subject.class_id
        ).order_by(Student.register_no).all()

        students_attendance = []
        for s in students:
            records = db.query(Attendance).join(
                AttendanceSession, Attendance.session_id == AttendanceSession.session_id
            ).filter(
                Attendance.student_id == s.student_id,
                AttendanceSession.subject_id == subject_id
            ).all()

            conducted = len(records)
            present = sum(1 for r in records if r.status == "P")
            absent = sum(1 for r in records if r.status == "A")
            od = sum(1 for r in records if r.status == "OD")

            percentage = 100.0
            if conducted > 0:
                percentage = round((present / conducted) * 100, 2)

            students_attendance.append(
                StudentAttendanceSummary(
                    student_id=s.student_id,
                    register_no=s.register_no,
                    student_name=s.student_name,
                    conducted_hours=conducted,
                    present_hours=present,
                    absent_hours=absent,
                    od_hours=od,
                    attendance_percentage=percentage
                )
            )

        return SubjectAttendanceReportResponse(
            subject_id=subject_id,
            subject_code=subject.subject_code,
            subject_name=subject.subject_name,
            students_attendance=students_attendance
        )

    @staticmethod
    def get_shortage_report(
        db: Session,
        class_id: UUID,
        threshold: float = 75.0
    ) -> ShortageReportResponse:
        class_obj = db.query(Class).filter(Class.class_id == class_id).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Class with ID '{class_id}' not found."
            )

        students = db.query(Student).filter(
            Student.class_id == class_id
        ).order_by(Student.register_no).all()

        students_shortage = []
        for s in students:
            records = db.query(Attendance).filter(
                Attendance.student_id == s.student_id
            ).all()

            conducted = len(records)
            present = sum(1 for r in records if r.status == "P")
            absent = sum(1 for r in records if r.status == "A")
            od = sum(1 for r in records if r.status == "OD")

            percentage = 100.0
            if conducted > 0:
                percentage = round((present / conducted) * 100, 2)

            if percentage < threshold:
                students_shortage.append(
                    StudentAttendanceSummary(
                        student_id=s.student_id,
                        register_no=s.register_no,
                        student_name=s.student_name,
                        conducted_hours=conducted,
                        present_hours=present,
                        absent_hours=absent,
                        od_hours=od,
                        attendance_percentage=percentage
                    )
                )

        return ShortageReportResponse(
            class_id=class_id,
            class_name=class_obj.class_name,
            threshold=threshold,
            students_shortage=students_shortage
        )
