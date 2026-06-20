from pydantic import BaseModel, Field, model_validator
from datetime import time
from uuid import UUID
from typing import Optional


class SlotBase(BaseModel):
    slot_no: int = Field(
        ...,
        gt=0,
        description="The unique slot number (e.g. 1)"
    )
    start_time: time = Field(
        ...,
        description="The start time of the slot in HH:MM format"
    )
    end_time: time = Field(
        ...,
        description="The end time of the slot in HH:MM format"
    )

    @model_validator(mode="after")
    def validate_times(self) -> "SlotBase":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be strictly before end_time.")
        return self


class SlotCreate(SlotBase):
    pass


class SlotUpdate(BaseModel):
    slot_no: Optional[int] = Field(None, gt=0)
    start_time: Optional[time] = None
    end_time: Optional[time] = None

    @model_validator(mode="after")
    def validate_times(self) -> "SlotUpdate":
        start = self.start_time
        end = self.end_time
        if start is not None and end is not None:
            if start >= end:
                raise ValueError("start_time must be strictly before end_time.")
        return self


class SlotResponse(SlotBase):
    slot_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "slot_id": "9d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "slot_no": 1,
                "start_time": "09:00:00",
                "end_time": "09:55:00"
            }
        }
