from pydantic import BaseModel
from uuid import UUID


class BatchBase(BaseModel):
    course_id: UUID
    batch_start_year: int
    batch_end_year: int


class BatchCreate(BatchBase):
    pass


class BatchResponse(BatchBase):
    batch_id: UUID

    class Config:
        from_attributes = True
