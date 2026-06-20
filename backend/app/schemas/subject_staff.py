from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List


class SubjectStaffBase(BaseModel):
    subject_id: UUID = Field(
        ...,
        description="The ID of the subject to assign"
    )
    staff_id: UUID = Field(
        ...,
        description="The ID of the staff member to map"
    )
    is_incharge: bool = Field(
        False,
        description="Whether this staff member is the primary in-charge of the subject"
    )


class SubjectStaffCreate(SubjectStaffBase):
    pass


class SubjectStaffUpdate(BaseModel):
    is_incharge: bool = Field(
        ...,
        description="Whether this staff member is the primary in-charge of the subject"
    )


class SubjectStaffResponse(SubjectStaffBase):
    mapping_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "mapping_id": "8a1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "subject_id": "7f1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "staff_id": "6f1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "is_incharge": True
            }
        }


class SubjectAssignmentInput(BaseModel):
    subject_id: UUID
    is_incharge: bool = False


class AssignSubjectsToStaffRequest(BaseModel):
    staff_id: UUID
    subjects: List[SubjectAssignmentInput]


class StaffAssignmentInput(BaseModel):
    staff_id: UUID
    is_incharge: bool = False


class AssignStaffsToSubjectRequest(BaseModel):
    subject_id: UUID
    staffs: List[StaffAssignmentInput]


class ReplaceStaffSubjectsRequest(BaseModel):
    subjects: List[SubjectAssignmentInput]


class ReplaceSubjectStaffsRequest(BaseModel):
    staffs: List[StaffAssignmentInput]


class MatrixAssignmentInput(BaseModel):
    subject_id: UUID
    staff_id: UUID
    is_incharge: bool = False


class BulkMatrixAssignmentRequest(BaseModel):
    mappings: List[MatrixAssignmentInput]


class BulkMatrixAssignmentResponse(BaseModel):
    total_requested: int
    created_count: int
    skipped_count: int


class BulkMappingCreatedResponse(BaseModel):
    created_count: int


class StaffSubjectResponse(BaseModel):
    subject_id: UUID
    subject_code: str
    subject_name: str
    is_incharge: bool

    class Config:
        from_attributes = True


class SubjectStaffMemberResponse(BaseModel):
    staff_id: UUID
    staff_name: str
    staff_code: str
    is_incharge: bool

    class Config:
        from_attributes = True


class DeleteSubjectStaffRequest(BaseModel):
    subject_id: UUID
    staff_id: UUID

