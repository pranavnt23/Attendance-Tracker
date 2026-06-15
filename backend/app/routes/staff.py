from fastapi import APIRouter

router = APIRouter(
    prefix="/staff",
    tags=["Staff"]
)


@router.get("/")
def get_staff():
    return {"message": "Staff endpoint"}
