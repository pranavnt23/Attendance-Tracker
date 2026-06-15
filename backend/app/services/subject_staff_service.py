from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import SubjectStaff
from app.schemas.subject_staff import SubjectStaffCreate, SubjectStaffUpdate
from app.services.subject_service import SubjectService
from app.services.staff_service import StaffService


class SubjectStaffService:
    @staticmethod
    def assign_staff(db: Session, mapping_in: SubjectStaffCreate) -> SubjectStaff:
        # Verify subject exists
        SubjectService.get(db, mapping_in.subject_id)

        # Verify staff exists
        StaffService.get(db, mapping_in.staff_id)

        # Prevent duplicate mappings
        existing = db.query(SubjectStaff).filter(
            SubjectStaff.subject_id == mapping_in.subject_id,
            SubjectStaff.staff_id == mapping_in.staff_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This staff member is already assigned to this subject."
            )

        db_mapping = SubjectStaff(
            subject_id=mapping_in.subject_id,
            staff_id=mapping_in.staff_id,
            is_incharge=mapping_in.is_incharge
        )
        db.add(db_mapping)
        db.commit()
        db.refresh(db_mapping)
        return db_mapping

    @staticmethod
    def get(db: Session, mapping_id: UUID) -> SubjectStaff:
        mapping = db.query(SubjectStaff).filter(
            SubjectStaff.mapping_id == mapping_id
        ).first()
        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject-Staff mapping with ID '{mapping_id}' not found."
            )
        return mapping

    @staticmethod
    def get_staff_by_subject(db: Session, subject_id: UUID) -> List[SubjectStaff]:
        # Verify subject exists
        SubjectService.get(db, subject_id)
        return db.query(SubjectStaff).filter(
            SubjectStaff.subject_id == subject_id
        ).all()

    @staticmethod
    def update_mapping(
        db: Session,
        mapping_id: UUID,
        mapping_in: SubjectStaffUpdate
    ) -> SubjectStaff:
        db_mapping = SubjectStaffService.get(db, mapping_id)
        db_mapping.is_incharge = mapping_in.is_incharge
        db.commit()
        db.refresh(db_mapping)
        return db_mapping

    @staticmethod
    def delete_mapping(db: Session, mapping_id: UUID) -> None:
        db_mapping = SubjectStaffService.get(db, mapping_id)
        db.delete(db_mapping)
        db.commit()
