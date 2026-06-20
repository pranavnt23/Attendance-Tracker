from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import SubjectStaff, Subject, Staff
from app.schemas.subject_staff import (
    SubjectStaffCreate,
    SubjectStaffUpdate,
    AssignSubjectsToStaffRequest,
    AssignStaffsToSubjectRequest,
    ReplaceStaffSubjectsRequest,
    ReplaceSubjectStaffsRequest,
    BulkMatrixAssignmentRequest
)
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

    @staticmethod
    def assign_subjects_to_staff(db: Session, req: AssignSubjectsToStaffRequest) -> int:
        # Validate staff exists
        StaffService.get(db, req.staff_id)

        # Validate all subjects exist
        for s_in in req.subjects:
            SubjectService.get(db, s_in.subject_id)

        # Get existing mappings
        existing_subject_ids = set(
            row[0] for row in db.query(SubjectStaff.subject_id).filter(
                SubjectStaff.staff_id == req.staff_id
            ).all()
        )

        created_count = 0
        for s_in in req.subjects:
            if s_in.subject_id in existing_subject_ids:
                continue

            db_mapping = SubjectStaff(
                subject_id=s_in.subject_id,
                staff_id=req.staff_id,
                is_incharge=s_in.is_incharge
            )
            db.add(db_mapping)
            created_count += 1

        if created_count > 0:
            db.commit()

        return created_count

    @staticmethod
    def assign_staffs_to_subject(db: Session, req: AssignStaffsToSubjectRequest) -> int:
        # Validate subject exists
        SubjectService.get(db, req.subject_id)

        # Validate all staff exist
        for s_in in req.staffs:
            StaffService.get(db, s_in.staff_id)

        # Get existing mappings
        existing_staff_ids = set(
            row[0] for row in db.query(SubjectStaff.staff_id).filter(
                SubjectStaff.subject_id == req.subject_id
            ).all()
        )

        created_count = 0
        for s_in in req.staffs:
            if s_in.staff_id in existing_staff_ids:
                continue

            db_mapping = SubjectStaff(
                subject_id=req.subject_id,
                staff_id=s_in.staff_id,
                is_incharge=s_in.is_incharge
            )
            db.add(db_mapping)
            created_count += 1

        if created_count > 0:
            db.commit()

        return created_count

    @staticmethod
    def replace_staff_subjects(db: Session, staff_id: UUID, req: ReplaceStaffSubjectsRequest) -> int:
        # Validate staff exists
        StaffService.get(db, staff_id)

        # Validate all subjects exist
        for s_in in req.subjects:
            SubjectService.get(db, s_in.subject_id)

        try:
            # Delete all existing mappings for the staff
            db.query(SubjectStaff).filter(SubjectStaff.staff_id == staff_id).delete()

            created_count = 0
            for s_in in req.subjects:
                db_mapping = SubjectStaff(
                    subject_id=s_in.subject_id,
                    staff_id=staff_id,
                    is_incharge=s_in.is_incharge
                )
                db.add(db_mapping)
                created_count += 1

            db.commit()
            return created_count
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def replace_subject_staffs(db: Session, subject_id: UUID, req: ReplaceSubjectStaffsRequest) -> int:
        # Validate subject exists
        SubjectService.get(db, subject_id)

        # Validate all staff exist
        for s_in in req.staffs:
            StaffService.get(db, s_in.staff_id)

        try:
            # Delete existing mappings
            db.query(SubjectStaff).filter(SubjectStaff.subject_id == subject_id).delete()

            created_count = 0
            for s_in in req.staffs:
                db_mapping = SubjectStaff(
                    subject_id=subject_id,
                    staff_id=s_in.staff_id,
                    is_incharge=s_in.is_incharge
                )
                db.add(db_mapping)
                created_count += 1

            db.commit()
            return created_count
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def bulk_matrix_assignment(db: Session, req: BulkMatrixAssignmentRequest) -> dict:
        # Validate all staff IDs
        for mapping in req.mappings:
            StaffService.get(db, mapping.staff_id)
            SubjectService.get(db, mapping.subject_id)

        # Get existing mappings as a set of tuples (subject_id, staff_id)
        existing_mappings = set(
            (row[0], row[1]) for row in db.query(SubjectStaff.subject_id, SubjectStaff.staff_id).all()
        )

        created_count = 0
        skipped_count = 0
        total_requested = len(req.mappings)

        # To prevent processing duplicates within the request itself
        processed_in_request = set()

        for mapping in req.mappings:
            key = (mapping.subject_id, mapping.staff_id)
            if key in existing_mappings or key in processed_in_request:
                skipped_count += 1
                continue

            db_mapping = SubjectStaff(
                subject_id=mapping.subject_id,
                staff_id=mapping.staff_id,
                is_incharge=mapping.is_incharge
            )
            db.add(db_mapping)
            processed_in_request.add(key)
            created_count += 1

        if created_count > 0:
            db.commit()

        return {
            "total_requested": total_requested,
            "created_count": created_count,
            "skipped_count": skipped_count
        }

    @staticmethod
    def get_subjects_assigned_to_staff(db: Session, staff_id: UUID) -> List[dict]:
        # Validate staff exists
        StaffService.get(db, staff_id)

        results = db.query(
            Subject.subject_id,
            Subject.subject_code,
            Subject.subject_name,
            SubjectStaff.is_incharge
        ).join(
            SubjectStaff, Subject.subject_id == SubjectStaff.subject_id
        ).filter(
            SubjectStaff.staff_id == staff_id
        ).all()

        return [
            {
                "subject_id": r.subject_id,
                "subject_code": r.subject_code,
                "subject_name": r.subject_name,
                "is_incharge": r.is_incharge
            }
            for r in results
        ]

    @staticmethod
    def get_staff_assigned_to_subject(db: Session, subject_id: UUID) -> List[dict]:
        # Validate subject exists
        SubjectService.get(db, subject_id)

        results = db.query(
            Staff.staff_id,
            Staff.staff_name,
            Staff.staff_code,
            SubjectStaff.is_incharge
        ).join(
            SubjectStaff, Staff.staff_id == SubjectStaff.staff_id
        ).filter(
            SubjectStaff.subject_id == subject_id
        ).all()

        return [
            {
                "staff_id": r.staff_id,
                "staff_name": r.staff_name,
                "staff_code": r.staff_code,
                "is_incharge": r.is_incharge
            }
            for r in results
        ]

    @staticmethod
    def delete_single_mapping(db: Session, subject_id: UUID, staff_id: UUID) -> None:
        mapping = db.query(SubjectStaff).filter(
            SubjectStaff.subject_id == subject_id,
            SubjectStaff.staff_id == staff_id
        ).first()
        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject-Staff mapping not found."
            )
        db.delete(mapping)
        db.commit()

