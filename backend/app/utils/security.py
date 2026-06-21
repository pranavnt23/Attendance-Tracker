import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

from jose import jwt
import bcrypt

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET environment variable is required!")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def create_access_token(
    data: dict,
    expires_minutes: int = 1440
):
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes
    )

    payload.update({"exp": expire})

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )