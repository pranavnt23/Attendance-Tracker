from fastapi import APIRouter

router = APIRouter(
    prefix="/timetable",
    tags=["Timetable"]
)


@router.get("/health")
def timetable_health():
    return {
        "message": "Timetable Route Working"
    }