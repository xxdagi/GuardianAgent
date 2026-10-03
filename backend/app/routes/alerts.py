from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.models import Alert, AlertCreate, AlertListItem, AlertRecord
from app.services.notifier import get_notifier

router = APIRouter(prefix="/alerts", tags=["alerts"])

_alerts: list[AlertRecord] = []  # in-memory feed for live dispatcher dashboard


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def build_simulated_message(
    language: str,
    maps_url: str,
    transcript_snippet: str | None,
    trigger_phrase: str | None,
) -> str:
    snippet = transcript_snippet or trigger_phrase
    if language == "pl":
        details = f' Usłyszano: "{snippet}".' if snippet else ""
        return f"🚨 ALARM BEZPIECZEŃSTWA! Potrzebuję pomocy. Moja lokalizacja: {maps_url}.{details}"
    details = f' Heard: "{snippet}".' if snippet else ""
    return f"🚨 SAFETY ALERT! I need help. My location: {maps_url}.{details}"


@router.get("", response_model=list[AlertListItem])
def list_alerts():
    """Returns alerts ordered newest first for the live dispatcher dashboard."""
    return list(reversed(_alerts))


@router.post("", response_model=Alert, status_code=201)
async def create_alert(body: AlertCreate):
    """Triggers silent emergency alert and dispatches notification via configured notifier."""
    maps_url = "location unavailable"
    if body.location:
        maps_url = (
            f"https://maps.google.com/?q={body.location.latitude:.6f},{body.location.longitude:.6f}"
        )

    simulated_message = build_simulated_message(
        language=body.language,
        maps_url=maps_url,
        transcript_snippet=body.transcript_snippet,
        trigger_phrase=body.trigger_phrase,
    )

    notifier = get_notifier()
    deliveries = await notifier.dispatch(
        alert_data=body,
        maps_url=maps_url,
        simulated_message=simulated_message,
    )

    alert = AlertRecord(
        id=str(uuid4()),
        session_id=body.session_id,
        level=body.level,
        source=body.source,
        trigger_phrase=body.trigger_phrase,
        transcript_snippet=body.transcript_snippet,
        location=body.location,
        deliveries=deliveries,
        created_at=_utc_now_iso(),
        language=body.language,
        recipient_name=body.recipient_name,
        recipient_phone=body.recipient_phone,
        maps_url=maps_url,
        simulated_message=simulated_message,
    )
    _alerts.append(alert)
    return Alert(
        id=alert.id,
        maps_url=alert.maps_url,
        deliveries=alert.deliveries,
        created_at=alert.created_at,
    )
