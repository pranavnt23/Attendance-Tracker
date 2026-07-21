from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.od_list import ODList
from app.database.models import Student, Class, Batch, Course, Department, College


class ODListService:

    @staticmethod
    def get_rep_class_hierarchy(db: Session, class_id: UUID):
        """
        Helper method to resolve college_id, department_id, and class_id
        from a class_id.
        """
        class_obj = db.query(Class).filter(Class.class_id == class_id).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Representative's class not found."
            )

        batch = class_obj.batch
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch information not found for class."
            )

        course = batch.course
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course information not found for class."
            )

        department = course.department
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department information not found for class."
            )

        college = department.college
        if not college:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="College information not found for department."
            )

        return college.college_id, department.department_id, class_obj.class_id

    @staticmethod
    def add_student(db: Session, student_id: UUID, current_rep: Student) -> ODList:
        """
        Add a student to the OD list for the representative's class.
        Automatically obtains college_id, department_id, class_id.
        Prevents duplicate entries and verifies student belongs to the class.
        """
        college_id, department_id, class_id = ODListService.get_rep_class_hierarchy(db, current_rep.class_id)

        # Validate that the student exists and belongs to rep's class
        student = db.query(Student).filter(
            Student.student_id == student_id,
            Student.class_id == class_id
        ).first()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student does not belong to your class."
            )

        # Check for duplicates in the same class
        existing = db.query(ODList).filter(
            ODList.class_id == class_id,
            ODList.student_id == student_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student is already in the OD list for this class."
            )

        od_entry = ODList(
            od_id=uuid4(),
            college_id=college_id,
            department_id=department_id,
            class_id=class_id,
            student_id=student_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(od_entry)
        db.commit()
        db.refresh(od_entry)
        return od_entry

    @staticmethod
    def bulk_add_students(db: Session, student_ids: List[UUID], current_rep: Student) -> dict:
        """
        Add multiple students to the OD list for the representative's class.
        """
        if not student_ids:
            return {"count": 0, "message": "No students provided."}

        college_id, department_id, class_id = ODListService.get_rep_class_hierarchy(db, current_rep.class_id)

        # Verify students belong to rep's class
        valid_students = db.query(Student).filter(
            Student.student_id.in_(student_ids),
            Student.class_id == class_id
        ).all()

        valid_student_ids = {s.student_id for s in valid_students}

        # Query existing OD entries for this class to avoid duplicates
        existing_od_records = db.query(ODList).filter(
            ODList.class_id == class_id,
            ODList.student_id.in_(valid_student_ids)
        ).all()
        existing_student_ids = {rec.student_id for rec in existing_od_records}

        to_add_ids = valid_student_ids - existing_student_ids

        now = datetime.utcnow()
        new_entries = [
            ODList(
                od_id=uuid4(),
                college_id=college_id,
                department_id=department_id,
                class_id=class_id,
                student_id=sid,
                created_at=now,
                updated_at=now
            )
            for sid in to_add_ids
        ]

        if new_entries:
            db.add_all(new_entries)
            db.commit()

        return {
            "count": len(new_entries),
            "message": f"Successfully added {len(new_entries)} student(s) to the OD list."
        }

    @staticmethod
    def remove_student(db: Session, student_id: UUID, current_rep: Student) -> None:
        """
        Remove a student from the OD list for the representative's class.
        Ensures the rep belongs to the same college, department, and class.
        """
        od_entry = db.query(ODList).filter(
            ODList.student_id == student_id,
            ODList.class_id == current_rep.class_id
        ).first()

        if not od_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found in OD list for your class."
            )

        db.delete(od_entry)
        db.commit()

    @staticmethod
    def bulk_remove_students(db: Session, student_ids: List[UUID], current_rep: Student) -> dict:
        """
        Remove multiple students from the OD list for the representative's class.
        """
        if not student_ids:
            return {"count": 0, "message": "No students specified for removal."}

        deleted_count = db.query(ODList).filter(
            ODList.class_id == current_rep.class_id,
            ODList.student_id.in_(student_ids)
        ).delete(synchronize_session=False)

        db.commit()

        return {
            "count": deleted_count,
            "message": f"Successfully removed {deleted_count} student(s) from the OD list."
        }

    @staticmethod
    def get_od_list(db: Session, current_rep: Student) -> List[dict]:
        """
        Get all students in the OD list for the representative's class.
        """
        records = db.query(ODList, Student).join(
            Student, ODList.student_id == Student.student_id
        ).filter(
            ODList.class_id == current_rep.class_id
        ).order_by(Student.register_no).all()

        return [
            {
                "student_id": student.student_id,
                "register_no": student.register_no,
                "student_name": student.student_name
            }
            for od, student in records
        ]

    @staticmethod
    def search_od_list(db: Session, query: Optional[str], current_rep: Student) -> List[dict]:
        """
        Search students in the representative's class by Register Number or Student Name.
        Used to select students to add to the OD list (or search existing class students).
        """
        db_query = db.query(Student).filter(Student.class_id == current_rep.class_id)

        if query and query.strip():
            search_pattern = f"%{query.strip()}%"
            db_query = db_query.filter(
                or_(
                    Student.register_no.ilike(search_pattern),
                    Student.student_name.ilike(search_pattern)
                )
            )

        students = db_query.order_by(Student.register_no).all()

        return [
            {
                "student_id": student.student_id,
                "register_no": student.register_no,
                "student_name": student.student_name
            }
            for student in students
        ]
