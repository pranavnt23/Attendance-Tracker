from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Department
from app.schemas.departments import DepartmentCreate, DepartmentUpdate
from app.services.college_service import CollegeService


class DepartmentService:
    @staticmethod
    def create(db: Session, department_in: DepartmentCreate) -> Department:
        # Verify college exists
        CollegeService.get(db, department_in.college_id)

        # Prevent duplicate department name under same college
        existing = db.query(Department).filter(
            Department.college_id == department_in.college_id,
            Department.department_name == department_in.department_name
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department '{department_in.department_name}' already exists in this college."
            )

        db_department = Department(
            college_id=department_in.college_id,
            department_name=department_in.department_name
        )
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        return db_department

    @staticmethod
    def get(db: Session, department_id: UUID) -> Department:
        department = db.query(Department).filter(
            Department.department_id == department_id
        ).first()
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with ID '{department_id}' not found."
            )
        return department

    @staticmethod
    def list_by_college(db: Session, college_id: UUID) -> List[Department]:
        # Verify college exists
        CollegeService.get(db, college_id)
        return db.query(Department).filter(
            Department.college_id == college_id
        ).all()

    @staticmethod
    def update(db: Session, department_id: UUID, department_in: DepartmentUpdate) -> Department:
        db_department = DepartmentService.get(db, department_id)

        update_data = department_in.model_dump(exclude_unset=True)

        if "department_name" in update_data:
            new_name = update_data["department_name"]
            if new_name != db_department.department_name:
                # Check duplicate name under the same college
                existing = db.query(Department).filter(
                    Department.college_id == db_department.college_id,
                    Department.department_name == new_name
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Department '{new_name}' already exists in this college."
                    )

        for key, value in update_data.items():
            setattr(db_department, key, value)

        db.commit()
        db.refresh(db_department)
        return db_department

    @staticmethod
    def delete(db: Session, department_id: UUID) -> None:
        db_department = DepartmentService.get(db, department_id)
        db.delete(db_department)
        db.commit()
