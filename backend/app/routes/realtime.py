from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.models import RealtimeSessionCreate, RealtimeSessionResponse

router = APIRouter(prefix="/realtime", tags=["realtime"])


def issue_realtime_session(_: RealtimeSessionCreate) -> RealtimeSessionResponse:
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat().replace(
        "+00:00", "Z"
    )
    return RealtimeSessionResponse(
        client_secret=f"ek_{uuid4().hex}",
        expires_at=expires_at,
        model="gpt-realtime-mini",
    )


@router.post("/session", response_model=RealtimeSessionResponse, status_code=201)
def create_realtime_session(body: RealtimeSessionCreate):
    return issue_realtime_session(body)
