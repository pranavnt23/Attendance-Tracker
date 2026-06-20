from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Dict, Any

from app.database.models import Timetable, Class, Slot, Subject
from app.schemas.timetable import TimetableCreate
from app.services.class_service import ClassService
from app.services.slot_service import SlotService
from app.services.subject_service import SubjectService


class TimetableService:
    @staticmethod
    def add_entry(db: Session, entry_in: TimetableCreate) -> Timetable:
        # Validate class, slot, subject exist
        ClassService.get(db, entry_in.class_id)
        SlotService.get(db, entry_in.slot_id)
        subject = SubjectService.get(db, entry_in.subject_id)

        # Validate subject belongs to class
        if subject.class_id != entry_in.class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with ID '{entry_in.subject_id}' does not belong to class '{entry_in.class_id}'."
            )

        # Prevent duplicate entries (Same class + day_of_week + slot_id + subject_id)
        existing = db.query(Timetable).filter(
            Timetable.class_id == entry_in.class_id,
            Timetable.day_of_week == entry_in.day_of_week,
            Timetable.slot_id == entry_in.slot_id,
            Timetable.subject_id == entry_in.subject_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A timetable entry already exists for this class, day, slot, and subject."
            )

        db_entry = Timetable(
            class_id=entry_in.class_id,
            day_of_week=entry_in.day_of_week,
            slot_id=entry_in.slot_id,
            subject_id=entry_in.subject_id
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry

    @staticmethod
    def bulk_upload(db: Session, entries_in: List[TimetableCreate]) -> List[Timetable]:
        # Validate every record and rollback if one fails
        try:
            timetable_entries = []
            
            # Cache sets for lookup optimization and tracking duplicates within the current upload batch
            existing_entries = set(
                (t.class_id, t.day_of_week, t.slot_id, t.subject_id) 
                for t in db.query(Timetable.class_id, Timetable.day_of_week, Timetable.slot_id, Timetable.subject_id).all()
            )
            batch_duplicates = set()

            class_ids = set(c[0] for c in db.query(Class.class_id).all())
            slot_ids = set(s[0] for s in db.query(Slot.slot_id).all())
            
            # Cache subject mapping to class
            subject_to_class = {
                sub.subject_id: sub.class_id 
                for sub in db.query(Subject.subject_id, Subject.class_id).all()
            }

            for entry in entries_in:
                # 1. Validate existence
                if entry.class_id not in class_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Class with ID '{entry.class_id}' not found."
                    )
                if entry.slot_id not in slot_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Slot with ID '{entry.slot_id}' not found."
                    )
                if entry.subject_id not in subject_to_class:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Subject with ID '{entry.subject_id}' not found."
                    )

                # 2. Validate subject belongs to class
                if subject_to_class[entry.subject_id] != entry.class_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Subject with ID '{entry.subject_id}' does not belong to class '{entry.class_id}'."
                    )

                # 3. Check duplicate entries
                entry_key = (entry.class_id, entry.day_of_week, entry.slot_id, entry.subject_id)
                if entry_key in existing_entries:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Timetable entry already exists for class '{entry.class_id}', day {entry.day_of_week}, slot '{entry.slot_id}', subject '{entry.subject_id}'."
                    )
                if entry_key in batch_duplicates:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duplicate timetable entries found within the upload batch."
                    )

                db_entry = Timetable(
                    class_id=entry.class_id,
                    day_of_week=entry.day_of_week,
                    slot_id=entry.slot_id,
                    subject_id=entry.subject_id
                )
                db.add(db_entry)
                timetable_entries.append(db_entry)
                batch_duplicates.add(entry_key)

            db.commit()
            for entry in timetable_entries:
                db.refresh(entry)
            return timetable_entries

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get(db: Session, timetable_id: UUID) -> Timetable:
        entry = db.query(Timetable).filter(
            Timetable.timetable_id == timetable_id
        ).first()
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable entry with ID '{timetable_id}' not found."
            )
        return entry

    @staticmethod
    def get_timetable_by_class(db: Session, class_id: UUID) -> Dict[str, Any]:
        # Validate class exists
        ClassService.get(db, class_id)

        entries = db.query(Timetable).filter(
            Timetable.class_id == class_id
        ).all()

        # Initialize dictionary for Mon (1) to Sat (6)
        grouped = {str(day): {} for day in range(1, 7)}

        for entry in entries:
            day_str = str(entry.day_of_week)
            slot = db.query(Slot).filter(Slot.slot_id == entry.slot_id).first()
            subject = db.query(Subject).filter(Subject.subject_id == entry.subject_id).first()

            slot_key = str(slot.slot_no) if slot else str(entry.slot_id)
            if slot_key not in grouped[day_str]:
                grouped[day_str][slot_key] = []
            
            grouped[day_str][slot_key].append({
                "timetable_id": str(entry.timetable_id),
                "slot_id": str(entry.slot_id),
                "slot_no": slot.slot_no if slot else None,
                "start_time": str(slot.start_time) if slot else None,
                "end_time": str(slot.end_time) if slot else None,
                "subject_id": str(entry.subject_id),
                "subject_code": subject.subject_code if subject else None,
                "subject_name": subject.subject_name if subject else None
            })
        return grouped

    @staticmethod
    def delete_entry(db: Session, timetable_id: UUID) -> None:
        db_entry = TimetableService.get(db, timetable_id)
        db.delete(db_entry)
        db.commit()

    @staticmethod
    def delete_timetable_by_class(db: Session, class_id: UUID) -> None:
        # Validate class exists
        ClassService.get(db, class_id)
        db.query(Timetable).filter(
            Timetable.class_id == class_id
        ).delete()
        db.commit()
