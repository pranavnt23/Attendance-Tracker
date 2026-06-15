from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from typing import Optional


class StaffBase(BaseModel):
    staff_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="The unique staff code/identifier"
    )
    staff_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Full name of the staff member"
    )
    email: EmailStr = Field(
        ...,
        description="Email address of the staff member"
    )


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    staff_code: Optional[str] = Field(None, min_length=1, max_length=50)
    staff_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None


class StaffResponse(StaffBase):
    staff_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "staff_id": "6f1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "staff_code": "STF101",
                "staff_name": "Dr. Sarah Connor",
                "email": "sarah.connor@institute.edu"
            }
        }
