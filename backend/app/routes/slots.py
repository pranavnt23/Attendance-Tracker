from fastapi import APIRouter

router = APIRouter(
    prefix="/slots",
    tags=["Slots"]
)


@router.get("/")
def get_slots():
    return {"message": "Slots endpoint"}
