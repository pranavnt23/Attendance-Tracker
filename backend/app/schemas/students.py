from pydantic import BaseModel


class StudentResponse(BaseModel):
    student_id: str
    student_name: str
    register_no: str