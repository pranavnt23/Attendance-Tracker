from pydantic import BaseModel, Field
from uuid import UUID
from typing import List


class StudentAttendanceSummary(BaseModel):
    student_id: UUID
    register_no: str
    student_name: str
    conducted_hours: int
    present_hours: int
    absent_hours: int
    od_hours: int
    attendance_percentage: float


class ClassAttendanceReportResponse(BaseModel):
    class_id: UUID
    class_name: str
    students_attendance: List[StudentAttendanceSummary]


class SubjectAttendanceReportResponse(BaseModel):
    subject_id: UUID
    subject_code: str
    subject_name: str
    students_attendance: List[StudentAttendanceSummary]


class ShortageReportResponse(BaseModel):
    class_id: UUID
    class_name: str
    threshold: float
    students_shortage: List[StudentAttendanceSummary]
