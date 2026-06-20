from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.db import get_db
from app.schemas.slots import SlotCreate, SlotUpdate, SlotResponse
from app.services.slot_service import SlotService

router = APIRouter(
    tags=["Slots"]
)


@router.post(
    "/api/slots",
    response_model=SlotResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new slot"
)
async def create_slot(
    slot: SlotCreate,
    db: Session = Depends(get_db)
):
    return SlotService.create(db, slot)


@router.get(
    "/api/slots",
    response_model=List[SlotResponse],
    summary="Get all slots"
)
async def list_slots(
    db: Session = Depends(get_db)
):
    return SlotService.list(db)


@router.get(
    "/api/slots/{slot_id}",
    response_model=SlotResponse,
    summary="Get a slot by ID"
)
async def get_slot(
    slot_id: UUID,
    db: Session = Depends(get_db)
):
    return SlotService.get(db, slot_id)


@router.put(
    "/api/slots/{slot_id}",
    response_model=SlotResponse,
    summary="Update a slot by ID"
)
async def update_slot(
    slot_id: UUID,
    slot: SlotUpdate,
    db: Session = Depends(get_db)
):
    return SlotService.update(db, slot_id, slot)


@router.delete(
    "/api/slots/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a slot by ID"
)
async def delete_slot(
    slot_id: UUID,
    db: Session = Depends(get_db)
):
    SlotService.delete(db, slot_id)
    return None
