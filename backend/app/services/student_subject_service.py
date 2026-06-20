from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Dict, Any

from app.database.models import StudentSubject, Student, Subject, Class
from app.schemas.student_subjects import (
    StudentSubjectCreate,
    AssignStudentsToSubjectRequest,
    AssignSubjectsToStudentRequest
)
from app.services.student_service import StudentService
from app.services.subject_service import SubjectService
from app.services.class_service import ClassService


class StudentSubjectService:
    @staticmethod
    def create(db: Session, mapping: StudentSubjectCreate) -> StudentSubject:
        # Validate student exists
        StudentService.get(db, mapping.student_id)
        
        # Validate subject exists
        subject = SubjectService.get(db, mapping.subject_id)

        # Validate subject is elective
        if subject.subject_type not in ["Elective Theory", "Elective Lab"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with ID '{mapping.subject_id}' is not an elective subject."
            )

        # Validate duplicate mapping
        existing = db.query(StudentSubject).filter(
            StudentSubject.student_id == mapping.student_id,
            StudentSubject.subject_id == mapping.subject_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This mapping already exists."
            )

        db_mapping = StudentSubject(
            student_id=mapping.student_id,
            subject_id=mapping.subject_id
        )
        db.add(db_mapping)
        db.commit()
        db.refresh(db_mapping)
        return db_mapping

    @staticmethod
    def delete(db: Session, student_id: UUID, subject_id: UUID) -> None:
        mapping = db.query(StudentSubject).filter(
            StudentSubject.student_id == student_id,
            StudentSubject.subject_id == subject_id
        ).first()
        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student subject mapping not found."
            )
        db.delete(mapping)
        db.commit()

    @staticmethod
    def assign_students(db: Session, req: AssignStudentsToSubjectRequest) -> int:
        # Validate subject exists
        subject = SubjectService.get(db, req.subject_id)

        # Validate subject is elective
        if subject.subject_type not in ["Elective Theory", "Elective Lab"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with ID '{req.subject_id}' is not an elective subject."
            )

        # Validate all students exist
        for s_id in req.student_ids:
            StudentService.get(db, s_id)

        # Get existing mappings to skip duplicates
        existing_student_ids = set(
            row[0] for row in db.query(StudentSubject.student_id).filter(
                StudentSubject.subject_id == req.subject_id
            ).all()
        )

        created_count = 0
        for s_id in req.student_ids:
            if s_id in existing_student_ids:
                continue
            
            db_mapping = StudentSubject(
                student_id=s_id,
                subject_id=req.subject_id
            )
            db.add(db_mapping)
            created_count += 1

        if created_count > 0:
            db.commit()

        return created_count

    @staticmethod
    def assign_subjects(db: Session, req: AssignSubjectsToStudentRequest) -> int:
        # Validate student exists
        StudentService.get(db, req.student_id)

        # Validate all subjects exist and are elective
        for sub_id in req.subject_ids:
            subject = SubjectService.get(db, sub_id)
            if subject.subject_type not in ["Elective Theory", "Elective Lab"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Subject with ID '{sub_id}' is not an elective subject."
                )

        # Get existing mappings to skip duplicates
        existing_subject_ids = set(
            row[0] for row in db.query(StudentSubject.subject_id).filter(
                StudentSubject.student_id == req.student_id
            ).all()
        )

        created_count = 0
        for sub_id in req.subject_ids:
            if sub_id in existing_subject_ids:
                continue

            db_mapping = StudentSubject(
                student_id=req.student_id,
                subject_id=sub_id
            )
            db.add(db_mapping)
            created_count += 1

        if created_count > 0:
            db.commit()

        return created_count

    @staticmethod
    def replace_student_subjects(db: Session, student_id: UUID, subject_ids: List[UUID]) -> int:
        # Validate student exists
        StudentService.get(db, student_id)

        # Validate all subjects exist and are elective
        for sub_id in subject_ids:
            subject = SubjectService.get(db, sub_id)
            if subject.subject_type not in ["Elective Theory", "Elective Lab"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Subject with ID '{sub_id}' is not an elective subject."
                )

        # Delete all existing mappings for student
        db.query(StudentSubject).filter(StudentSubject.student_id == student_id).delete()

        created_count = 0
        for sub_id in subject_ids:
            db_mapping = StudentSubject(
                student_id=student_id,
                subject_id=sub_id
            )
            db.add(db_mapping)
            created_count += 1

        db.commit()
        return created_count

    @staticmethod
    def replace_subject_students(db: Session, subject_id: UUID, student_ids: List[UUID]) -> int:
        # Validate subject exists
        subject = SubjectService.get(db, subject_id)

        # Validate subject is elective
        if subject.subject_type not in ["Elective Theory", "Elective Lab"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject with ID '{subject_id}' is not an elective subject."
            )

        # Validate all students exist
        for s_id in student_ids:
            StudentService.get(db, s_id)

        # Delete all existing mappings for subject
        db.query(StudentSubject).filter(StudentSubject.subject_id == subject_id).delete()

        created_count = 0
        for s_id in student_ids:
            db_mapping = StudentSubject(
                student_id=s_id,
                subject_id=subject_id
            )
            db.add(db_mapping)
            created_count += 1

        db.commit()
        return created_count

    @staticmethod
    def get_students_of_subject(db: Session, subject_id: UUID) -> List[Student]:
        subject = SubjectService.get(db, subject_id)
        
        if subject.subject_type in ["Theory", "Lab", "Activity"]:
            # Compulsory: return all students in the class
            return db.query(Student).filter(
                Student.class_id == subject.class_id
            ).order_by(Student.register_no).all()
        else:
            # Elective: return only mapped students
            return db.query(Student).join(
                StudentSubject, Student.student_id == StudentSubject.student_id
            ).filter(
                StudentSubject.subject_id == subject_id
            ).order_by(Student.register_no).all()

    @staticmethod
    def get_subjects_of_student(db: Session, student_id: UUID) -> List[Subject]:
        student = StudentService.get(db, student_id)

        # Fetch compulsory subjects for the student's class
        compulsory_subjects = db.query(Subject).filter(
            Subject.class_id == student.class_id,
            Subject.subject_type.in_(["Theory", "Lab", "Activity"])
        ).all()

        # Fetch mapped elective subjects
        elective_subjects = db.query(Subject).join(
            StudentSubject, Subject.subject_id == StudentSubject.subject_id
        ).filter(
            StudentSubject.student_id == student_id
        ).all()

        return compulsory_subjects + elective_subjects

    @staticmethod
    def get_all_elective_mappings_of_class(db: Session, class_id: UUID) -> List[Dict[str, Any]]:
        # Validate class exists
        ClassService.get(db, class_id)

        # Get all elective subjects of the class
        elective_subjects = db.query(Subject).filter(
            Subject.class_id == class_id,
            Subject.subject_type.in_(["Elective Theory", "Elective Lab"])
        ).order_by(Subject.subject_code).all()

        results = []
        for sub in elective_subjects:
            mapped_students = db.query(Student).join(
                StudentSubject, Student.student_id == StudentSubject.student_id
            ).filter(
                StudentSubject.subject_id == sub.subject_id
            ).order_by(Student.student_name).all()

            results.append({
                "subject_id": sub.subject_id,
                "subject_name": sub.subject_name,
                "students": [
                    {
                        "student_id": s.student_id,
                        "student_name": s.student_name
                    }
                    for s in mapped_students
                ]
            })

        return results
