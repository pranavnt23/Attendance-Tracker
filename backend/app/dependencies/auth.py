from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Student
from app.utils.security import SECRET_KEY as JWT_SECRET, ALGORITHM as JWT_ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        register_no: str = payload.get("sub")
        if register_no is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(Student).filter(Student.register_no == register_no).first()
    if user is None:
        raise credentials_exception
    return user


def require_attendance_rep(current_user: Student = Depends(get_current_user)):
    if current_user.role != "attendance_rep":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Only attendance representatives can perform this action."
        )
    return current_user

