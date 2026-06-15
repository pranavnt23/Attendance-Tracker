from fastapi import APIRouter

router = APIRouter(
    prefix="/subject-staff",
    tags=["Subject Staff Mapping"]
)


@router.get("/")
def get_subject_staff():
    return {"message": "Subject Staff Mapping endpoint"}
