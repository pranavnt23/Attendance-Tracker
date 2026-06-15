from fastapi import APIRouter

router = APIRouter(
    prefix="/batches",
    tags=["Batches"]
)


@router.get("/")
def get_batches():
    return {"message": "Batches endpoint"}
