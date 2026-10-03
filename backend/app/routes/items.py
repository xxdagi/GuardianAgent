from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.models import Item, ItemCreate

router = APIRouter(prefix="/items", tags=["items"])

_items: list[Item] = []  # in-memory demo storage; replace with real DB when needed


@router.get("", response_model=list[Item])
def list_items():
    return _items


@router.post("", response_model=Item, status_code=201)
def create_item(body: ItemCreate):
    item = Item(id=str(uuid4()), name=body.name, created_at=datetime.now(timezone.utc))
    _items.append(item)
    return item
