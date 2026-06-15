from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Staff
from app.schemas.staff import StaffCreate, StaffUpdate


class StaffService:
    @staticmethod
    def create(db: Session, staff_in: StaffCreate) -> Staff:
        # Check unique staff_code
        existing_code = db.query(Staff).filter(
            Staff.staff_code == staff_in.staff_code
        ).first()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Staff with code '{staff_in.staff_code}' already exists."
            )

        # Check unique email
        existing_email = db.query(Staff).filter(
            Staff.email == staff_in.email
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Staff with email '{staff_in.email}' already exists."
            )

        db_staff = Staff(
            staff_code=staff_in.staff_code,
            staff_name=staff_in.staff_name,
            email=staff_in.email
        )
        db.add(db_staff)
        db.commit()
        db.refresh(db_staff)
        return db_staff

    @staticmethod
    def get(db: Session, staff_id: UUID) -> Staff:
        staff = db.query(Staff).filter(
            Staff.staff_id == staff_id
        ).first()
        if not staff:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Staff with ID '{staff_id}' not found."
            )
        return staff

    @staticmethod
    def list(db: Session) -> List[Staff]:
        return db.query(Staff).all()

    @staticmethod
    def update(db: Session, staff_id: UUID, staff_in: StaffUpdate) -> Staff:
        db_staff = StaffService.get(db, staff_id)

        update_data = staff_in.model_dump(exclude_unset=True)

        if "staff_code" in update_data:
            new_code = update_data["staff_code"]
            if new_code != db_staff.staff_code:
                existing = db.query(Staff).filter(
                    Staff.staff_code == new_code
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Staff with code '{new_code}' already exists."
                    )

        if "email" in update_data:
            new_email = update_data["email"]
            if new_email != db_staff.email:
                existing = db.query(Staff).filter(
                    Staff.email == new_email
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Staff with email '{new_email}' already exists."
                    )

        for key, value in update_data.items():
            setattr(db_staff, key, value)

        db.commit()
        db.refresh(db_staff)
        return db_staff

    @staticmethod
    def delete(db: Session, staff_id: UUID) -> None:
        db_staff = StaffService.get(db, staff_id)
        db.delete(db_staff)
        db.commit()
