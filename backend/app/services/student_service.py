from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.database.models import Student, Class
from app.schemas.students import StudentCreate, StudentUpdate, RoleUpdate, BulkRegisterResponse
from app.services.class_service import ClassService
from app.utils.security import hash_password


class StudentService:
    @staticmethod
    def create(db: Session, student_in: StudentCreate) -> Student:
        # Verify class exists
        ClassService.get(db, student_in.class_id)

        # Check unique register_no
        existing_reg = db.query(Student).filter(
            Student.register_no == student_in.register_no
        ).first()
        if existing_reg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student with register number '{student_in.register_no}' already exists."
            )

        # Check unique email
        existing_email = db.query(Student).filter(
            Student.email == student_in.email
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Student with email '{student_in.email}' already exists."
            )

        # Hash the password
        pwd_hash = hash_password(student_in.password)

        db_student = Student(
            register_no=student_in.register_no,
            student_name=student_in.student_name,
            email=student_in.email,
            password_hash=pwd_hash,
            role=student_in.role,
            class_id=student_in.class_id
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def get(db: Session, student_id: UUID) -> Student:
        student = db.query(Student).filter(
            Student.student_id == student_id
        ).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student with ID '{student_id}' not found."
            )
        return student

    @staticmethod
    def list_by_class(db: Session, class_id: UUID) -> List[Student]:
        # Verify class exists
        ClassService.get(db, class_id)
        return db.query(Student).filter(
            Student.class_id == class_id
        ).all()

    @staticmethod
    def update(db: Session, student_id: UUID, student_in: StudentUpdate) -> Student:
        db_student = StudentService.get(db, student_id)

        update_data = student_in.model_dump(exclude_unset=True)

        if "class_id" in update_data:
            ClassService.get(db, update_data["class_id"])

        if "register_no" in update_data:
            new_reg = update_data["register_no"]
            if new_reg != db_student.register_no:
                existing = db.query(Student).filter(
                    Student.register_no == new_reg
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Student with register number '{new_reg}' already exists."
                    )

        if "email" in update_data:
            new_email = update_data["email"]
            if new_email != db_student.email:
                existing = db.query(Student).filter(
                    Student.email == new_email
                ).first()
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Student with email '{new_email}' already exists."
                    )

        for key, value in update_data.items():
            setattr(db_student, key, value)

        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def patch_role(db: Session, student_id: UUID, role_in: RoleUpdate) -> Student:
        db_student = StudentService.get(db, student_id)
        db_student.role = role_in.role
        db.commit()
        db.refresh(db_student)
        return db_student

    @staticmethod
    def bulk_register(db: Session, students_in: List[StudentCreate]) -> BulkRegisterResponse:
        inserted_count = 0
        skipped_count = 0
        duplicate_register_numbers = []

        # Get all existing register numbers and emails
        existing_reg = set(r[0] for r in db.query(Student.register_no).all())
        existing_emails = set(e[0] for e in db.query(Student.email).all())

        # Cache class ids to speed up checks
        class_ids = set(c[0] for c in db.query(Class.class_id).all())

        for student_in in students_in:
            # Verify class exists
            if student_in.class_id not in class_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Class with ID '{student_in.class_id}' does not exist."
                )

            # Skip duplicate student by register number or email
            if student_in.register_no in existing_reg or student_in.email in existing_emails:
                skipped_count += 1
                duplicate_register_numbers.append(student_in.register_no)
                continue

            # Hash the password
            pwd_hash = hash_password(student_in.password)

            db_student = Student(
                register_no=student_in.register_no,
                student_name=student_in.student_name,
                email=student_in.email,
                password_hash=pwd_hash,
                role=student_in.role,
                class_id=student_in.class_id
            )
            db.add(db_student)
            existing_reg.add(student_in.register_no)
            existing_emails.add(student_in.email)
            inserted_count += 1

        db.commit()
        return BulkRegisterResponse(
            inserted_count=inserted_count,
            skipped_count=skipped_count,
            duplicate_register_numbers=duplicate_register_numbers
        )

    @staticmethod
    def delete(db: Session, student_id: UUID) -> None:
        db_student = StudentService.get(db, student_id)
        db.delete(db_student)
        db.commit()
