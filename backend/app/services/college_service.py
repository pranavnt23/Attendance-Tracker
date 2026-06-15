from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import College
from app.schemas.colleges import CollegeCreate, CollegeUpdate


class CollegeService:
    @staticmethod
    def create(db: Session, college_in: CollegeCreate) -> College:
        # Check for duplicate college code
        existing = db.query(College).filter(
            College.college_code == college_in.college_code
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"College with code '{college_in.college_code}' already exists."
            )

        db_college = College(
            college_name=college_in.college_name,
            college_code=college_in.college_code
        )
        db.add(db_college)
        db.commit()
        db.refresh(db_college)
        return db_college

    @staticmethod
    def get(db: Session, college_id: UUID) -> College:
        college = db.query(College).filter(
            College.college_id == college_id
        ).first()
        if not college:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"College with ID '{college_id}' not found."
            )
        return college

    @staticmethod
    def list(db: Session) -> List[College]:
        return db.query(College).all()

    @staticmethod
    def update(db: Session, college_id: UUID, college_in: CollegeUpdate) -> College:
        db_college = CollegeService.get(db, college_id)

        update_data = college_in.model_dump(exclude_unset=True)

        if "college_code" in update_data:
            new_code = update_data["college_code"]
            if new_code != db_college.college_code:
                # Check for duplicate code
                existing = db.query(College).filter(
                    College.college_code == new_code
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"College with code '{new_code}' already exists."
                    )

        for key, value in update_data.items():
            setattr(db_college, key, value)

        db.commit()
        db.refresh(db_college)
        return db_college

    @staticmethod
    def delete(db: Session, college_id: UUID) -> None:
        db_college = CollegeService.get(db, college_id)
        db.delete(db_college)
        db.commit()
