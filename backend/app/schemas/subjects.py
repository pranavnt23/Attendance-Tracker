from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class SubjectBase(BaseModel):
    class_id: UUID = Field(
        ...,
        description="The ID of the class this subject belongs to"
    )
    subject_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="The unique code of the subject"
    )
    subject_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Full name of the subject"
    )
    subject_type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Type of the subject (e.g. Theory, Lab)"
    )
    attendance_required: bool = Field(
        True,
        description="Whether attendance is required for this subject"
    )


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = Field(None, min_length=1, max_length=255)
    subject_type: Optional[str] = Field(None, min_length=1, max_length=50)
    attendance_required: Optional[bool] = None


class SubjectResponse(SubjectBase):
    subject_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "subject_id": "7f1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "class_id": "4d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "subject_code": "MSS601",
                "subject_name": "Agile Methods",
                "subject_type": "Theory",
                "attendance_required": True
            }
        }
