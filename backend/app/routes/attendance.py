from fastapi import APIRouter

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.get("/health")
def attendance_health():
    return {
        "message": "Attendance Route Working"
    }