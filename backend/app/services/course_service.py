from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Course
from app.schemas.courses import CourseCreate, CourseUpdate
from app.services.department_service import DepartmentService


class CourseService:
    @staticmethod
    def create(db: Session, course_in: CourseCreate) -> Course:
        # Verify department exists
        DepartmentService.get(db, course_in.department_id)

        # Double check duration years (redundant to Pydantic gt=0, but good practice)
        if course_in.duration_years <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duration years must be greater than 0."
            )

        # Prevent duplicate course name under same department
        existing = db.query(Course).filter(
            Course.department_id == course_in.department_id,
            Course.course_name == course_in.course_name
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course '{course_in.course_name}' already exists in this department."
            )

        db_course = Course(
            department_id=course_in.department_id,
            course_name=course_in.course_name,
            duration_years=course_in.duration_years
        )
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course

    @staticmethod
    def get(db: Session, course_id: UUID) -> Course:
        course = db.query(Course).filter(
            Course.course_id == course_id
        ).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course with ID '{course_id}' not found."
            )
        return course

    @staticmethod
    def list_by_department(db: Session, department_id: UUID) -> List[Course]:
        # Verify department exists
        DepartmentService.get(db, department_id)
        return db.query(Course).filter(
            Course.department_id == department_id
        ).all()

    @staticmethod
    def update(db: Session, course_id: UUID, course_in: CourseUpdate) -> Course:
        db_course = CourseService.get(db, course_id)

        update_data = course_in.model_dump(exclude_unset=True)

        if "duration_years" in update_data:
            if update_data["duration_years"] <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Duration years must be greater than 0."
                )

        if "course_name" in update_data:
            new_name = update_data["course_name"]
            if new_name != db_course.course_name:
                # Check duplicate name under the same department
                existing = db.query(Course).filter(
                    Course.department_id == db_course.department_id,
                    Course.course_name == new_name
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Course '{new_name}' already exists in this department."
                    )

        for key, value in update_data.items():
            setattr(db_course, key, value)

        db.commit()
        db.refresh(db_course)
        return db_course

    @staticmethod
    def delete(db: Session, course_id: UUID) -> None:
        db_course = CourseService.get(db, course_id)
        db.delete(db_course)
        db.commit()
