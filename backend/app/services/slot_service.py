from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Slot, Timetable
from app.schemas.slots import SlotCreate, SlotUpdate


class SlotService:
    @staticmethod
    def create(db: Session, slot_in: SlotCreate) -> Slot:
        # Check duplicate slot_no
        existing = db.query(Slot).filter(
            Slot.slot_no == slot_in.slot_no
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slot number '{slot_in.slot_no}' already exists."
            )

        db_slot = Slot(
            slot_no=slot_in.slot_no,
            start_time=slot_in.start_time,
            end_time=slot_in.end_time
        )
        db.add(db_slot)
        db.commit()
        db.refresh(db_slot)
        return db_slot

    @staticmethod
    def get(db: Session, slot_id: UUID) -> Slot:
        slot = db.query(Slot).filter(
            Slot.slot_id == slot_id
        ).first()
        if not slot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Slot with ID '{slot_id}' not found."
            )
        return slot

    @staticmethod
    def list(db: Session) -> List[Slot]:
        return db.query(Slot).order_by(Slot.slot_no).all()

    @staticmethod
    def update(db: Session, slot_id: UUID, slot_in: SlotUpdate) -> Slot:
        db_slot = SlotService.get(db, slot_id)

        update_data = slot_in.model_dump(exclude_unset=True)

        if "slot_no" in update_data:
            new_no = update_data["slot_no"]
            if new_no != db_slot.slot_no:
                existing = db.query(Slot).filter(
                    Slot.slot_no == new_no
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Slot number '{new_no}' already exists."
                    )

        for key, value in update_data.items():
            setattr(db_slot, key, value)

        db.commit()
        db.refresh(db_slot)
        return db_slot

    @staticmethod
    def delete(db: Session, slot_id: UUID) -> None:
        db_slot = SlotService.get(db, slot_id)

        # Deletion rules: Do not allow deletion if timetable entries exist.
        timetable_exists = db.query(Timetable).filter(
            Timetable.slot_id == slot_id
        ).first()
        if timetable_exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete slot because active timetable entries depend on it."
            )

        db.delete(db_slot)
        db.commit()
