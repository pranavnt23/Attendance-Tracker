from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from typing import Optional, List, Literal


class StudentBase(BaseModel):
    register_no: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="The unique register/roll number of the student"
    )
    student_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Full name of the student"
    )
    email: EmailStr = Field(
        ...,
        description="Institute email address of the student"
    )
    role: Literal["student", "attendance_rep"] = Field(
        ...,
        description="Role of the student, must be 'student' or 'attendance_rep'"
    )
    class_id: UUID = Field(
        ...,
        description="The ID of the class the student belongs to"
    )


class StudentCreate(StudentBase):
    password: str = Field(
        ...,
        min_length=6,
        description="Raw password for the student account (hashed before storage)"
    )


class StudentUpdate(BaseModel):
    register_no: Optional[str] = Field(None, min_length=1, max_length=50)
    student_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    role: Optional[Literal["student", "attendance_rep"]] = None
    class_id: Optional[UUID] = None


class RoleUpdate(BaseModel):
    role: Literal["student", "attendance_rep"] = Field(
        ...,
        description="The new role to assign to the student"
    )


class StudentResponse(StudentBase):
    student_id: UUID

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "student_id": "5e1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                "register_no": "20L101",
                "student_name": "John Doe",
                "email": "johndoe@institute.edu",
                "role": "student",
                "class_id": "4d1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
            }
        }


class BulkRegisterResponse(BaseModel):
    inserted_count: int = Field(..., description="Number of students successfully registered")
    skipped_count: int = Field(..., description="Number of duplicate student records skipped")
    duplicate_register_numbers: List[str] = Field(
        ...,
        description="List of register numbers that were skipped because they already exist"
    )