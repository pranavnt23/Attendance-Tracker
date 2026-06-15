from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class CollegeBase(BaseModel):
    college_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="The full name of the college"
    )
    college_code: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="The unique code identifying the college"
    )


class CollegeCreate(CollegeBase):
    pass


class CollegeUpdate(BaseModel):
    college_name: Optional[str] = Field(None, min_length=1, max_length=255)
    college_code: Optional[str] = Field(None, min_length=1, max_length=50)


class CollegeResponse(CollegeBase):
    college_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "college_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "college_name": "PSG College of Technology",
                "college_code": "PSG"
            }
        }
