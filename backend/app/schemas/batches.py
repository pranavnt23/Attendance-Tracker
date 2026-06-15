from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from typing import Optional


class BatchBase(BaseModel):
    course_id: UUID = Field(
        ...,
        description="The ID of the course this batch belongs to"
    )
    batch_start_year: int = Field(
        ...,
        description="The start year of the batch (e.g. 2023)"
    )
    batch_end_year: int = Field(
        ...,
        description="The end year of the batch (e.g. 2027)"
    )

    @model_validator(mode="after")
    def validate_years(self) -> "BatchBase":
        if self.batch_start_year >= self.batch_end_year:
            raise ValueError("batch_start_year must be strictly less than batch_end_year.")
        return self


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    course_id: Optional[UUID] = None
    batch_start_year: Optional[int] = None
    batch_end_year: Optional[int] = None

    @model_validator(mode="after")
    def validate_years(self) -> "BatchUpdate":
        start = self.batch_start_year
        end = self.batch_end_year
        if start is not None and end is not None:
            if start >= end:
                raise ValueError("batch_start_year must be strictly less than batch_end_year.")
        return self


class BatchResponse(BatchBase):
    batch_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "batch_id": "3c1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "course_id": "7a3deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "batch_start_year": 2023,
                "batch_end_year": 2027
            }
        }
