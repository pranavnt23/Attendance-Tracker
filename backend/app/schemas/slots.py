from pydantic import BaseModel
from datetime import time
from uuid import UUID


class SlotBase(BaseModel):
    slot_no: int
    start_time: time
    end_time: time


class SlotCreate(SlotBase):
    pass


class SlotResponse(SlotBase):
    slot_id: UUID

    class Config:
        from_attributes = True
