from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ClassBase(BaseModel):
    batch_id: UUID
    class_name: str
    section: Optional[str] = None
    current_semester: int


class ClassCreate(ClassBase):
    pass


class ClassResponse(ClassBase):
    class_id: UUID

    class Config:
        from_attributes = True
