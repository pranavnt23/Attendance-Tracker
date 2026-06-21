from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user, require_attendance_rep
from app.schemas.student_subjects import (
    StudentSubjectCreate,
    StudentSubjectResponse,
    AssignStudentsToSubjectRequest,
    AssignSubjectsToStudentRequest,
    ReplaceStudentSubjectsRequest,
    ReplaceSubjectStudentsRequest,
    BulkMappingResponse,
    SubjectStudentResponse,
    StudentSubjectListResponse,
    ClassElectiveMappingResponse
)
from app.services.student_subject_service import StudentSubjectService

router = APIRouter(
    tags=["Student Subjects"]
)


@router.post(
    "/api/student-subjects",
    response_model=StudentSubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a single student-subject mapping (Attendance Rep only)"
)
async def create_mapping(
    mapping: StudentSubjectCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    return StudentSubjectService.create(db, mapping)


@router.delete(
    "/api/student-subjects",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a single student-subject mapping (Attendance Rep only)"
)
async def delete_mapping(
    request: StudentSubjectCreate,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    StudentSubjectService.delete(db, request.student_id, request.subject_id)
    return None


@router.post(
    "/api/student-subjects/assign-students",
    response_model=BulkMappingResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign multiple students to one elective subject (Attendance Rep only)"
)
async def assign_students(
    request: AssignStudentsToSubjectRequest,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    count = StudentSubjectService.assign_students(db, request)
    return BulkMappingResponse(success=True, created_count=count)


@router.post(
    "/api/student-subjects/assign-subjects",
    response_model=BulkMappingResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign multiple elective subjects to one student (Attendance Rep only)"
)
async def assign_subjects(
    request: AssignSubjectsToStudentRequest,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    count = StudentSubjectService.assign_subjects(db, request)
    return BulkMappingResponse(success=True, created_count=count)


@router.put(
    "/api/student-subjects/student/{student_id}",
    response_model=BulkMappingResponse,
    status_code=status.HTTP_200_OK,
    summary="Replace elective subjects for a student (Attendance Rep only)"
)
async def replace_student_subjects(
    student_id: UUID,
    request: ReplaceStudentSubjectsRequest,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    count = StudentSubjectService.replace_student_subjects(db, student_id, request.subject_ids)
    return BulkMappingResponse(success=True, created_count=count)


@router.put(
    "/api/student-subjects/subject/{subject_id}",
    response_model=BulkMappingResponse,
    status_code=status.HTTP_200_OK,
    summary="Replace students assigned to an elective subject (Attendance Rep only)"
)
async def replace_subject_students(
    subject_id: UUID,
    request: ReplaceSubjectStudentsRequest,
    db: Session = Depends(get_db),
    current_rep: Student = Depends(require_attendance_rep)
):
    count = StudentSubjectService.replace_subject_students(db, subject_id, request.student_ids)
    return BulkMappingResponse(success=True, created_count=count)


@router.get(
    "/api/subjects/{subject_id}/students",
    response_model=List[SubjectStudentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all students assigned to a subject"
)
async def get_students_of_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StudentSubjectService.get_students_of_subject(db, subject_id)


@router.get(
    "/api/students/{student_id}/subjects",
    response_model=List[StudentSubjectListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all subjects assigned to a student (compulsory + mapped electives)"
)
async def get_subjects_of_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StudentSubjectService.get_subjects_of_student(db, student_id)


@router.get(
    "/api/classes/{class_id}/student-subjects",
    response_model=List[ClassElectiveMappingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all elective subject mappings of a class"
)
async def get_all_elective_mappings_of_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    return StudentSubjectService.get_all_elective_mappings_of_class(db, class_id)
