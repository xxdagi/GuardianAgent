from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# --- Starter Item Models ---
class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class Item(BaseModel):
    id: str
    name: str
    created_at: datetime


# --- Alert Models ---
class Location(BaseModel):
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)
    accuracy: float | None = None


class DeliveryStatus(BaseModel):
    channel: Literal["mock", "telegram"] = "mock"
    status: Literal["sent", "failed"] = "sent"


class AlertCreate(BaseModel):
    session_id: str
    level: Literal["alert", "emergency"]
    source: Literal["keyword", "agent", "manual"]
    trigger_phrase: str | None = None
    language: Literal["pl", "en"] = "pl"
    recipient_name: str
    recipient_phone: str
    location: Location | None = None
    transcript_snippet: str | None = None


class Alert(BaseModel):
    id: str
    session_id: str
    level: Literal["alert", "emergency"]
    source: Literal["keyword", "agent", "manual"]
    trigger_phrase: str | None = None
    language: Literal["pl", "en"]
    recipient_name: str
    recipient_phone: str
    location: Location | None = None
    transcript_snippet: str | None = None
    maps_url: str | None = None
    simulated_message: str
    deliveries: list[DeliveryStatus]
    created_at: datetime
