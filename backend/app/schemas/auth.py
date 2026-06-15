from pydantic import BaseModel


class LoginRequest(BaseModel):
    register_no: str
    password: str