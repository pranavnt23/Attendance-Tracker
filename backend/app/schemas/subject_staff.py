from pydantic import BaseModel
from uuid import UUID


class SubjectStaffBase(BaseModel):
    subject_id: UUID
    staff_id: UUID
    is_incharge: bool = False


class SubjectStaffCreate(SubjectStaffBase):
    pass


class SubjectStaffResponse(SubjectStaffBase):
    mapping_id: UUID

    class Config:
        from_attributes = True
