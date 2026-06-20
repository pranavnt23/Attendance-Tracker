from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.database.models import Student
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
from app.utils.security import verify_password, create_access_token, hash_password
from app.utils.otp import generate_otp
from app.utils.email import send_otp_email

class AuthService:
    @staticmethod
    def login(db: Session, request: LoginRequest) -> LoginResponse:
        # Find student by register number
        student = db.query(Student).filter(
            Student.register_no == request.register_no
        ).first()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid register number or password."
            )

        # Verify password hash
        if not verify_password(request.password, student.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid register number or password."
            )

        # Generate JWT token
        # sub is set to register_no as required by get_current_user dependency
        access_token = create_access_token(data={"sub": student.register_no})

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            student_id=student.student_id,
            class_id=student.class_id,
            role=student.role
        )

    @staticmethod
    async def forgot_password(
        db: Session,
        request: ForgotPasswordRequest
    ) -> ForgotPasswordResponse:
        # Find student using register_no
        student = db.query(Student).filter(
            Student.register_no == request.register_no
        ).first()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        # Generate OTP
        otp = generate_otp()

        # Store OTP and set expiry (current UTC + 5 minutes)
        student.otp_code = otp
        student.otp_expiry = datetime.utcnow() + timedelta(minutes=5)
        student.otp_verified = False

        db.commit()

        # Send OTP email
        await send_otp_email(student.email, otp)

        return ForgotPasswordResponse(
            success=True,
            message="OTP sent successfully"
        )

    @staticmethod
    def verify_otp(
        db: Session,
        request: VerifyOtpRequest
    ) -> VerifyOtpResponse:
        # Validate register_no
        student = db.query(Student).filter(
            Student.register_no == request.register_no
        ).first()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        # Validate OTP
        if not student.otp_code or student.otp_code != request.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )

        # Validate expiry
        if not student.otp_expiry or datetime.utcnow() > student.otp_expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired"
            )

        # Set otp_verified=True
        student.otp_verified = True
        db.commit()

        return VerifyOtpResponse(
            success=True,
            message="OTP verified"
        )

    @staticmethod
    def reset_password(
        db: Session,
        request: ResetPasswordRequest
    ) -> ResetPasswordResponse:
        # Validate student
        student = db.query(Student).filter(
            Student.register_no == request.register_no
        ).first()

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        # Ensure otp_verified=True
        if not student.otp_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP not verified"
            )

        # Hash new password using existing security utility
        student.password_hash = hash_password(request.new_password)

        # Clear OTP and verified status
        student.otp_code = None
        student.otp_expiry = None
        student.otp_verified = False

        db.commit()

        return ResetPasswordResponse(
            success=True,
            message="Password reset successful"
        )

