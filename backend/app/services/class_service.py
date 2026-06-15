from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Class
from app.schemas.classes import ClassCreate, ClassUpdate, SemesterPromotion
from app.services.batch_service import BatchService


class ClassService:
    @staticmethod
    def create(db: Session, class_in: ClassCreate) -> Class:
        # Verify batch exists
        BatchService.get(db, class_in.batch_id)

        # Prevent duplicate class names within the same batch
        existing = db.query(Class).filter(
            Class.batch_id == class_in.batch_id,
            Class.class_name == class_in.class_name,
            Class.section == class_in.section
        ).first()
        if existing:
            sect_str = f" section '{class_in.section}'" if class_in.section else " (no section)"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Class '{class_in.class_name}' with{sect_str} already exists in this batch."
            )

        db_class = Class(
            batch_id=class_in.batch_id,
            class_name=class_in.class_name,
            section=class_in.section,
            current_semester=class_in.current_semester
        )
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        return db_class

    @staticmethod
    def get(db: Session, class_id: UUID) -> Class:
        class_obj = db.query(Class).filter(
            Class.class_id == class_id
        ).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Class with ID '{class_id}' not found."
            )
        return class_obj

    @staticmethod
    def list_by_batch(db: Session, batch_id: UUID) -> List[Class]:
        # Verify batch exists
        BatchService.get(db, batch_id)
        return db.query(Class).filter(
            Class.batch_id == batch_id
        ).all()

    @staticmethod
    def update(db: Session, class_id: UUID, class_in: ClassUpdate) -> Class:
        db_class = ClassService.get(db, class_id)

        update_data = class_in.model_dump(exclude_unset=True)

        batch_id = update_data.get("batch_id", db_class.batch_id)
        class_name = update_data.get("class_name", db_class.class_name)
        section = update_data.get("section", db_class.section)

        if "batch_id" in update_data:
            # Verify batch exists
            BatchService.get(db, batch_id)

        if (
            batch_id != db_class.batch_id or
            class_name != db_class.class_name or
            section != db_class.section
        ):
            # Prevent duplicate
            existing = db.query(Class).filter(
                Class.batch_id == batch_id,
                Class.class_name == class_name,
                Class.section == section
            ).first()
            if existing:
                sect_str = f" section '{section}'" if section else " (no section)"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Class '{class_name}' with{sect_str} already exists in this batch."
                )

        for key, value in update_data.items():
            setattr(db_class, key, value)

        db.commit()
        db.refresh(db_class)
        return db_class

    @staticmethod
    def promote_semester(db: Session, class_id: UUID, promo_in: SemesterPromotion) -> Class:
        db_class = ClassService.get(db, class_id)
        db_class.current_semester = promo_in.current_semester
        db.commit()
        db.refresh(db_class)
        return db_class

    @staticmethod
    def delete(db: Session, class_id: UUID) -> None:
        db_class = ClassService.get(db, class_id)
        db.delete(db_class)
        db.commit()
