from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class ClassBase(BaseModel):
    batch_id: UUID = Field(
        ...,
        description="The ID of the batch this class belongs to"
    )
    class_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Name of the class (e.g. CSE)"
    )
    section: Optional[str] = Field(
        None,
        max_length=20,
        description="Optional section identifier (e.g. A)"
    )
    current_semester: int = Field(
        ...,
        gt=0,
        description="Current semester number, must be greater than 0"
    )


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    batch_id: Optional[UUID] = None
    class_name: Optional[str] = Field(None, min_length=1, max_length=100)
    section: Optional[str] = Field(None, max_length=20)
    current_semester: Optional[int] = Field(None, gt=0)


class SemesterPromotion(BaseModel):
    current_semester: int = Field(
        ...,
        gt=0,
        description="The new semester number to promote the class to"
    )


class ClassResponse(ClassBase):
    class_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "class_id": "4d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "batch_id": "3c1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "class_name": "CSE",
                "section": "A",
                "current_semester": 5
            }
        }
