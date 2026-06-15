from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class DepartmentBase(BaseModel):
    college_id: UUID = Field(
        ...,
        description="The ID of the college this department belongs to"
    )
    department_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Name of the department"
    )


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    department_name: Optional[str] = Field(None, min_length=1, max_length=255)


class DepartmentResponse(DepartmentBase):
    department_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "department_id": "8c2deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "college_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "department_name": "Computer Science"
            }
        }
