from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.schemas.courses import CourseCreate, CourseUpdate, CourseResponse
from app.services.course_service import CourseService

router = APIRouter(
    tags=["Courses"]
)


@router.post(
    "/api/courses",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course"
)
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db)
):
    return CourseService.create(db, course)


@router.get(
    "/api/departments/{department_id}/courses",
    response_model=List[CourseResponse],
    summary="Get all courses under a department"
)
async def list_courses_by_department(
    department_id: UUID,
    db: Session = Depends(get_db)
):
    return CourseService.list_by_department(db, department_id)


@router.put(
    "/api/courses/{course_id}",
    response_model=CourseResponse,
    summary="Update a course by ID"
)
async def update_course(
    course_id: UUID,
    course: CourseUpdate,
    db: Session = Depends(get_db)
):
    return CourseService.update(db, course_id, course)


@router.delete(
    "/api/courses/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a course by ID"
)
async def delete_course(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    CourseService.delete(db, course_id)
    return None
