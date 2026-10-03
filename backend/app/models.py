from datetime import datetime

from pydantic import BaseModel, Field


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class Item(BaseModel):
    id: str
    name: str
    created_at: datetime
