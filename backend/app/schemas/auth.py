from pydantic import BaseModel, Field
from uuid import UUID


class LoginRequest(BaseModel):
    register_no: str = Field(
        ...,
        min_length=1,
        description="The unique register/roll number of the student"
    )
    password: str = Field(
        ...,
        min_length=1,
        description="The raw password of the user"
    )


class LoginResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type, e.g. bearer")
    student_id: UUID = Field(..., description="The ID of the authenticated student")
    class_id: UUID = Field(..., description="The ID of the student's class")
    role: str = Field(..., description="Role of the student, e.g. student or attendance_rep")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "student_id": "5e1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "class_id": "4d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "role": "attendance_rep"
            }
        }


class ForgotPasswordRequest(BaseModel):
    register_no: str = Field(
        ...,
        min_length=1,
        description="The unique register/roll number of the student"
    )


class ForgotPasswordResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the action was successful")
    message: str = Field(..., description="Response message detailing the result")


class VerifyOtpRequest(BaseModel):
    register_no: str = Field(
        ...,
        min_length=1,
        description="The unique register/roll number of the student"
    )
    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
        description="The 6-digit OTP code"
    )


class VerifyOtpResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the action was successful")
    message: str = Field(..., description="Response message detailing the result")


class ResetPasswordRequest(BaseModel):
    register_no: str = Field(
        ...,
        min_length=1,
        description="The unique register/roll number of the student"
    )
    new_password: str = Field(
        ...,
        min_length=6,
        description="The new password to set for the student"
    )


class ResetPasswordResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the action was successful")
    message: str = Field(..., description="Response message detailing the result")