from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List, Literal


class AttendanceSessionCreate(BaseModel):
    class_id: UUID = Field(..., description="ID of the class")
    session_date: date = Field(..., description="Date of the session in YYYY-MM-DD format")
    slot_id: UUID = Field(..., description="ID of the Slot")
    subject_id: UUID = Field(..., description="ID of the Subject")
    staff_id: UUID = Field(..., description="ID of the Staff conducting the session")
    remarks: Optional[str] = Field(None, description="Optional remarks for the session")


class AttendanceSessionResponse(BaseModel):
    session_id: UUID
    class_id: UUID
    session_date: date
    slot_id: UUID
    subject_id: UUID
    staff_id: UUID
    created_by_student_id: UUID
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SessionStudentResponse(BaseModel):
    student_id: UUID
    register_no: str
    student_name: str
    status: str = "P"

    class Config:
        from_attributes = True


class ODStudent(BaseModel):
    student_id: UUID = Field(..., description="ID of the student on Official Duty")
    od_reason: str = Field(..., min_length=1, description="Reason for Official Duty")


class AttendanceMarkRequest(BaseModel):
    session_id: UUID = Field(..., description="ID of the attendance session")
    absentees: List[UUID] = Field(default=[], description="List of student IDs who are absent")
    od_students: List[ODStudent] = Field(default=[], description="List of student IDs on OD with reasons")


class AttendanceRecordView(BaseModel):
    student_name: str
    status: str
    od_reason: Optional[str] = None

    class Config:
        from_attributes = True


class SessionAttendanceViewResponse(BaseModel):
    session_id: UUID
    subject_name: str
    session_date: date
    slot_no: int
    attendance: List[AttendanceRecordView]


class AttendanceRecordUpdate(BaseModel):
    student_id: UUID = Field(..., description="ID of the student to update")
    status: Literal["P", "A", "OD"] = Field(..., description="New attendance status (P, A, OD)")
    od_reason: Optional[str] = Field(None, description="Optional reason if status is OD")


class SubjectSubstitutionRequest(BaseModel):
    subject_id: UUID = Field(..., description="ID of the new subject taught")
    remarks: Optional[str] = Field("Substitution class", description="Optional replacement remarks")


class SessionDetailsResponse(BaseModel):
    session_date: date
    slot_no: int
    planned_subject: str
    conducted_subject: str
    remarks: Optional[str] = None
