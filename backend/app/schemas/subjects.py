from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class SubjectBase(BaseModel):
    class_id: UUID
    subject_code: str
    subject_name: str
    subject_type: str
    attendance_required: bool = True


class SubjectCreate(SubjectBase):
    pass


class SubjectResponse(SubjectBase):
    subject_id: UUID

    class Config:
        from_attributes = True
