from pydantic import BaseModel, Field
from uuid import UUID
from typing import List


class StudentSubjectCreate(BaseModel):
    student_id: UUID = Field(..., description="ID of the student")
    subject_id: UUID = Field(..., description="ID of the subject")


class AssignStudentsToSubjectRequest(BaseModel):
    subject_id: UUID = Field(..., description="ID of the elective subject")
    student_ids: List[UUID] = Field(..., description="List of student IDs to assign")


class AssignSubjectsToStudentRequest(BaseModel):
    student_id: UUID = Field(..., description="ID of the student")
    subject_ids: List[UUID] = Field(..., description="List of elective subject IDs to assign")


class ReplaceStudentSubjectsRequest(BaseModel):
    subject_ids: List[UUID] = Field(..., description="Full list of elective subject IDs to set for the student")


class ReplaceSubjectStudentsRequest(BaseModel):
    student_ids: List[UUID] = Field(..., description="Full list of student IDs to set for the elective subject")


class StudentSubjectResponse(BaseModel):
    mapping_id: UUID
    student_id: UUID
    subject_id: UUID

    class Config:
        from_attributes = True


class BulkMappingResponse(BaseModel):
    success: bool
    created_count: int


class SubjectStudentResponse(BaseModel):
    student_id: UUID
    register_no: str
    student_name: str

    class Config:
        from_attributes = True


class StudentSubjectListResponse(BaseModel):
    subject_id: UUID
    subject_code: str
    subject_name: str

    class Config:
        from_attributes = True


class MappingStudentInfo(BaseModel):
    student_id: UUID
    student_name: str

    class Config:
        from_attributes = True


class ClassElectiveMappingResponse(BaseModel):
    subject_id: UUID
    subject_name: str
    students: List[MappingStudentInfo]
