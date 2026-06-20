from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Subject
from app.schemas.subjects import SubjectCreate, SubjectUpdate
from app.services.class_service import ClassService


class SubjectService:
    @staticmethod
    def create(db: Session, subject_in: SubjectCreate) -> Subject:
        # Verify class exists
        ClassService.get(db, subject_in.class_id)

        # Ensure subject_code is unique within the same class
        existing = db.query(Subject).filter(
            Subject.class_id == subject_in.class_id,
            Subject.subject_code == subject_in.subject_code
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with code '{subject_in.subject_code}' already exists in this class."
            )

        db_subject = Subject(
            class_id=subject_in.class_id,
            subject_code=subject_in.subject_code,
            subject_name=subject_in.subject_name,
            subject_type=subject_in.subject_type,
            attendance_required=subject_in.attendance_required
        )
        db.add(db_subject)
        db.commit()
        db.refresh(db_subject)
        return db_subject

    @staticmethod
    def get(db: Session, subject_id: UUID) -> Subject:
        subject = db.query(Subject).filter(
            Subject.subject_id == subject_id
        ).first()
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID '{subject_id}' not found."
            )
        return subject

    @staticmethod
    def list_by_class(db: Session, class_id: UUID) -> List[Subject]:
        # Verify class exists
        ClassService.get(db, class_id)
        return db.query(Subject).filter(
            Subject.class_id == class_id
        ).all()

    @staticmethod
    def update(db: Session, subject_id: UUID, subject_in: SubjectUpdate) -> Subject:
        db_subject = SubjectService.get(db, subject_id)

        update_data = subject_in.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(db_subject, key, value)

        db.commit()
        db.refresh(db_subject)
        return db_subject

    @staticmethod
    def delete(db: Session, subject_id: UUID) -> None:
        db_subject = SubjectService.get(db, subject_id)
        db.delete(db_subject)
        db.commit()
