from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.database.models import Student
from app.schemas.auth import LoginRequest, LoginResponse
from app.utils.security import verify_password, create_access_token


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
