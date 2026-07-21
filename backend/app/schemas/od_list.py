from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List
from datetime import datetime


class ODListCreate(BaseModel):
    student_id: UUID = Field(
        ...,
        description="The ID of the student to add to the OD list"
    )


class ODListBulkCreate(BaseModel):
    student_ids: List[UUID] = Field(
        ...,
        min_items=1,
        description="List of student IDs to add to the OD list"
    )


class ODListBulkDelete(BaseModel):
    student_ids: List[UUID] = Field(
        ...,
        min_items=1,
        description="List of student IDs to remove from the OD list"
    )


class ODListBulkResponse(BaseModel):
    count: int = Field(..., description="Number of records affected")
    message: str = Field(..., description="Summary message")


class ODListItemResponse(BaseModel):
    student_id: UUID
    register_no: str
    student_name: str

    class Config:
        from_attributes = True


class ODListResponse(BaseModel):
    od_id: UUID
    college_id: UUID
    department_id: UUID
    class_id: UUID
    student_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
