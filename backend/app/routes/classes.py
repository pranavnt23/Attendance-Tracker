from fastapi import APIRouter

router = APIRouter(
    prefix="/classes",
    tags=["Classes"]
)


@router.get("/")
def get_classes():
    return {"message": "Classes endpoint"}
