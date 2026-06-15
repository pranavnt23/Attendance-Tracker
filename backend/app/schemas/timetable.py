from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List, Dict, Any


class TimetableBase(BaseModel):
    class_id: UUID = Field(
        ...,
        description="The ID of the class this timetable entry is for"
    )
    day_of_week: int = Field(
        ...,
        ge=1,
        le=6,
        description="Day of the week (1 = Monday, 6 = Saturday)"
    )
    slot_id: UUID = Field(
        ...,
        description="The ID of the slot for this entry"
    )
    subject_id: UUID = Field(
        ...,
        description="The ID of the subject being taught"
    )


class TimetableCreate(TimetableBase):
    pass


class TimetableResponse(TimetableBase):
    timetable_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "timetable_id": "0d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "class_id": "4d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "day_of_week": 1,
                "slot_id": "9d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "subject_id": "7f1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
            }
        }
