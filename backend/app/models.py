from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class Item(BaseModel):
    id: str
    name: str
    created_at: datetime


class RealtimeSessionCreate(BaseModel):
    session_id: str
    language: Literal["pl", "en"]
    alert_phrases: list[str]
    emergency_phrases: list[str]


class RealtimeSessionResponse(BaseModel):
    client_secret: str
    expires_at: str
    model: str


class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: float


class Delivery(BaseModel):
    channel: Literal["mock", "sms", "voice", "telegram"]
    status: Literal["sent", "failed"]


class AlertCreate(BaseModel):
    session_id: str
    level: Literal["alert", "emergency"]
    source: Literal["keyword", "agent", "manual"]
    trigger_phrase: str | None = None
    language: Literal["pl", "en"]
    recipient_name: str
    recipient_phone: str
    location: Location | None
    transcript_snippet: str | None = None


class Alert(BaseModel):
    id: str
    maps_url: str
    deliveries: list[Delivery]
    created_at: str


class AlertListItem(BaseModel):
    id: str
    session_id: str
    created_at: str
    level: Literal["alert", "emergency"]
    source: Literal["keyword", "agent", "manual"]
    trigger_phrase: str | None = None
    transcript_snippet: str | None = None
    location: Location | None
    deliveries: list[Delivery]


class AlertRecord(AlertListItem):
    language: Literal["pl", "en"]
    recipient_name: str
    recipient_phone: str
    maps_url: str
    simulated_message: str
