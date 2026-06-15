from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class StaffBase(BaseModel):
    staff_code: str
    staff_name: str
    email: Optional[EmailStr] = None


class StaffCreate(StaffBase):
    pass


class StaffResponse(StaffBase):
    staff_id: UUID

    class Config:
        from_attributes = True
