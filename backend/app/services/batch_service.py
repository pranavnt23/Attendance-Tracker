from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Batch
from app.schemas.batches import BatchCreate, BatchUpdate
from app.services.course_service import CourseService


class BatchService:
    @staticmethod
    def create(db: Session, batch_in: BatchCreate) -> Batch:
        # Verify course exists
        CourseService.get(db, batch_in.course_id)

        # Year check (start < end)
        if batch_in.batch_start_year >= batch_in.batch_end_year:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch start year must be less than batch end year."
            )

        # Check for duplicate batch for this course and year range
        existing = db.query(Batch).filter(
            Batch.course_id == batch_in.course_id,
            Batch.batch_start_year == batch_in.batch_start_year,
            Batch.batch_end_year == batch_in.batch_end_year
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A batch with this start and end year already exists for this course."
            )

        db_batch = Batch(
            course_id=batch_in.course_id,
            batch_start_year=batch_in.batch_start_year,
            batch_end_year=batch_in.batch_end_year
        )
        db.add(db_batch)
        db.commit()
        db.refresh(db_batch)
        return db_batch

    @staticmethod
    def get(db: Session, batch_id: UUID) -> Batch:
        batch = db.query(Batch).filter(
            Batch.batch_id == batch_id
        ).first()
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Batch with ID '{batch_id}' not found."
            )
        return batch

    @staticmethod
    def list_by_course(db: Session, course_id: UUID) -> List[Batch]:
        # Verify course exists
        CourseService.get(db, course_id)
        return db.query(Batch).filter(
            Batch.course_id == course_id
        ).all()

    @staticmethod
    def update(db: Session, batch_id: UUID, batch_in: BatchUpdate) -> Batch:
        db_batch = BatchService.get(db, batch_id)

        update_data = batch_in.model_dump(exclude_unset=True)

        course_id = update_data.get("course_id", db_batch.course_id)
        start_year = update_data.get("batch_start_year", db_batch.batch_start_year)
        end_year = update_data.get("batch_end_year", db_batch.batch_end_year)

        if "course_id" in update_data:
            # Verify new course exists
            CourseService.get(db, course_id)

        if "batch_start_year" in update_data or "batch_end_year" in update_data:
            if start_year >= end_year:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Batch start year must be less than batch end year."
                )

        # If duplicate check is needed
        if (
            course_id != db_batch.course_id or
            start_year != db_batch.batch_start_year or
            end_year != db_batch.batch_end_year
        ):
            existing = db.query(Batch).filter(
                Batch.course_id == course_id,
                Batch.batch_start_year == start_year,
                Batch.batch_end_year == end_year
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A batch with this start and end year already exists for this course."
                )

        for key, value in update_data.items():
            setattr(db_batch, key, value)

        db.commit()
        db.refresh(db_batch)
        return db_batch

    @staticmethod
    def delete(db: Session, batch_id: UUID) -> None:
        db_batch = BatchService.get(db, batch_id)
        db.delete(db_batch)
        db.commit()
