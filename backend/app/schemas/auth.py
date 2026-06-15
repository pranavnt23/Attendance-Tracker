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