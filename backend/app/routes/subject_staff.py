from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.schemas.subject_staff import (
    SubjectStaffCreate,
    SubjectStaffUpdate,
    SubjectStaffResponse,
    AssignSubjectsToStaffRequest,
    AssignStaffsToSubjectRequest,
    ReplaceStaffSubjectsRequest,
    ReplaceSubjectStaffsRequest,
    BulkMatrixAssignmentRequest,
    BulkMatrixAssignmentResponse,
    BulkMappingCreatedResponse,
    StaffSubjectResponse,
    SubjectStaffMemberResponse,
    DeleteSubjectStaffRequest
)
from app.services.subject_staff_service import SubjectStaffService

router = APIRouter(
    tags=["Subject Staff Mapping"]
)


@router.post(
    "/api/subject-staff",
    response_model=SubjectStaffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a staff member to a subject"
)
async def assign_staff(
    mapping: SubjectStaffCreate,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.assign_staff(db, mapping)


@router.get(
    "/api/subjects/{subject_id}/staff",
    response_model=List[SubjectStaffMemberResponse],
    summary="Get all staff assignments for a subject"
)
async def list_staff_by_subject(
    subject_id: UUID,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.get_staff_assigned_to_subject(db, subject_id)


@router.put(
    "/api/subject-staff/{mapping_id}",
    response_model=SubjectStaffResponse,
    summary="Update staff assignment detail"
)
async def update_mapping(
    mapping_id: UUID,
    mapping: SubjectStaffUpdate,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.update_mapping(db, mapping_id, mapping)


@router.delete(
    "/api/subject-staff/{mapping_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete staff assignment"
)
async def delete_mapping(
    mapping_id: UUID,
    db: Session = Depends(get_db)
):
    SubjectStaffService.delete_mapping(db, mapping_id)
    return None


@router.post(
    "/api/subject-staff/assign-subjects",
    response_model=BulkMappingCreatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign multiple subjects to one staff member"
)
async def assign_subjects_to_staff(
    request: AssignSubjectsToStaffRequest,
    db: Session = Depends(get_db)
):
    count = SubjectStaffService.assign_subjects_to_staff(db, request)
    return BulkMappingCreatedResponse(created_count=count)


@router.post(
    "/api/subject-staff/assign-staffs",
    response_model=BulkMappingCreatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign multiple staff members to one subject"
)
async def assign_staffs_to_subject(
    request: AssignStaffsToSubjectRequest,
    db: Session = Depends(get_db)
):
    count = SubjectStaffService.assign_staffs_to_subject(db, request)
    return BulkMappingCreatedResponse(created_count=count)


@router.put(
    "/api/subject-staff/staff/{staff_id}",
    response_model=BulkMappingCreatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Replace all subject mappings of a staff member"
)
async def replace_staff_subjects(
    staff_id: UUID,
    request: ReplaceStaffSubjectsRequest,
    db: Session = Depends(get_db)
):
    count = SubjectStaffService.replace_staff_subjects(db, staff_id, request)
    return BulkMappingCreatedResponse(created_count=count)


@router.put(
    "/api/subject-staff/subject/{subject_id}",
    response_model=BulkMappingCreatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Replace all staff mappings of a subject"
)
async def replace_subject_staffs(
    subject_id: UUID,
    request: ReplaceSubjectStaffsRequest,
    db: Session = Depends(get_db)
):
    count = SubjectStaffService.replace_subject_staffs(db, subject_id, request)
    return BulkMappingCreatedResponse(created_count=count)


@router.post(
    "/api/subject-staff/bulk",
    response_model=BulkMatrixAssignmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Bulk matrix assignment for subjects and staff"
)
async def bulk_matrix_assignment(
    request: BulkMatrixAssignmentRequest,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.bulk_matrix_assignment(db, request)


@router.get(
    "/api/staff/{staff_id}/subjects",
    response_model=List[StaffSubjectResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all subjects assigned to a staff member"
)
async def get_subjects_assigned_to_staff(
    staff_id: UUID,
    db: Session = Depends(get_db)
):
    return SubjectStaffService.get_subjects_assigned_to_staff(db, staff_id)


@router.delete(
    "/api/subject-staff",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a single subject-staff mapping"
)
async def delete_single_mapping(
    request: DeleteSubjectStaffRequest,
    db: Session = Depends(get_db)
):
    SubjectStaffService.delete_single_mapping(db, request.subject_id, request.staff_id)
    return None

