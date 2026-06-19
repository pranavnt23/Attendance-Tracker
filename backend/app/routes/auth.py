from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Student
from app.dependencies.auth import get_current_user
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
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


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Request a password reset OTP email"
)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    return await AuthService.forgot_password(db, request)


@router.post(
    "/verify-otp",
    response_model=VerifyOtpResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify password reset OTP code"
)
async def verify_otp(
    request: VerifyOtpRequest,
    db: Session = Depends(get_db)
):
    return AuthService.verify_otp(db, request)


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password after OTP verification"
)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    return AuthService.reset_password(db, request)