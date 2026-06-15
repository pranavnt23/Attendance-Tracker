from fastapi import APIRouter

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


@router.get("/health")
def students_health():
    return {
        "message": "Students Route Working"
    }