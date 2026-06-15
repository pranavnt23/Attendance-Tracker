from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


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
