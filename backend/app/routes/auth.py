from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.students import StudentResponse
from app.services.auth_service import AuthService

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Login a student / attendance representative"
)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    return AuthService.login(db, request)


@router.get(
    "/me",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current logged-in user profile"
)
async def get_me(
    current_user: Student = Depends(get_current_user)
):
    return current_user