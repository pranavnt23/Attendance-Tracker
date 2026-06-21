from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, time
from typing import Optional, List, Dict


class StudentProfileResponse(BaseModel):
    student_id: UUID
    register_no: str
    student_name: str
    email: str
    role: str
    class_name: str
    semester: int
    course_name: str
    department_name: str

    class Config:
        from_attributes = True


class SubjectWiseAttendanceResponse(BaseModel):
    subject_id: UUID
    subject_code: str
    subject_name: str
    conducted_hours: int
    present_hours: int
    absent_hours: int
    od_hours: int
    attendance_percentage: float


class AttendanceHistoryResponse(BaseModel):
    date: date
    day: str
    slot_no: int
    subject_name: str
    status: str
    od_reason: Optional[str] = None



class StaticTimetableSlot(BaseModel):
    slot_no: int
    start_time: time
    end_time: time
    subject_code: str
    subject_name: str
    faculty_name: str


class StaticTimetableResponse(BaseModel):
    day_timetable: Dict[str, List[StaticTimetableSlot]] = Field(
        ...,
        description="Timetable entries grouped day-wise (1=Monday to 6=Saturday)"
    )


class ActualTimetableSlot(BaseModel):
    slot_no: int
    start_time: time
    end_time: time
    subject_name: str
    faculty: str
    attendance_status: str = "NOT_MARKED"


class SubjectDetailsResponse(BaseModel):
    subject_name: str
    subject_code: str
    present_hours: int
    absent_hours: int
    od_hours: int
    conducted_hours: int
    attendance_percentage: float
