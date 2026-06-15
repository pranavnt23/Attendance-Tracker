from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class CourseBase(BaseModel):
    department_id: UUID = Field(
        ...,
        description="The ID of the department this course belongs to"
    )
    course_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Name of the course"
    )
    duration_years: int = Field(
        ...,
        gt=0,
        description="Duration of the course in years, must be greater than 0"
    )


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    course_name: Optional[str] = Field(None, min_length=1, max_length=255)
    duration_years: Optional[int] = Field(None, gt=0)


class CourseResponse(CourseBase):
    course_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "course_id": "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "department_id": "8c2deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "course_name": "M.Sc Software Systems",
                "duration_years": 5
            }
        }
