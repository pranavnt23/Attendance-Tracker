from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.schemas.departments import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services.department_service import DepartmentService

router = APIRouter(
    tags=["Departments"]
)


@router.post(
    "/api/departments",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new department"
)
async def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db)
):
    return DepartmentService.create(db, department)


@router.get(
    "/api/colleges/{college_id}/departments",
    response_model=List[DepartmentResponse],
    summary="Get all departments belonging to a college"
)
async def list_departments_by_college(
    college_id: UUID,
    db: Session = Depends(get_db)
):
    return DepartmentService.list_by_college(db, college_id)


@router.put(
    "/api/departments/{department_id}",
    response_model=DepartmentResponse,
    summary="Update a department by ID"
)
async def update_department(
    department_id: UUID,
    department: DepartmentUpdate,
    db: Session = Depends(get_db)
):
    return DepartmentService.update(db, department_id, department)


@router.delete(
    "/api/departments/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a department by ID"
)
async def delete_department(
    department_id: UUID,
    db: Session = Depends(get_db)
):
    DepartmentService.delete(db, department_id)
    return None
