from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.models import Alert, AlertCreate
from app.services.notifier import get_notifier

router = APIRouter(prefix="/alerts", tags=["alerts"])

_alerts: list[Alert] = []  # in-memory feed for live dispatcher dashboard


def build_simulated_message(
    language: str,
    maps_url: str | None,
    transcript_snippet: str | None,
    trigger_phrase: str | None,
) -> str:
    snippet = transcript_snippet or trigger_phrase
    if language == "pl":
        loc_str = maps_url if maps_url else "Lokalizacja niedostępna"
        details = f" Usłyszano: \"{snippet}\"." if snippet else ""
        return f"🚨 ALARM BEZPIECZEŃSTWA! Potrzebuję pomocy. Moja lokalizacja: {loc_str}.{details}"
    else:
        loc_str = maps_url if maps_url else "Location unavailable"
        details = f" Heard: \"{snippet}\"." if snippet else ""
        return f"🚨 SAFETY ALERT! I need help. My location: {loc_str}.{details}"


@router.get("", response_model=list[Alert])
def list_alerts():
    """Returns alerts ordered newest first for the live dispatcher dashboard."""
    return sorted(_alerts, key=lambda a: a.created_at, reverse=True)


@router.post("", response_model=Alert, status_code=201)
async def create_alert(body: AlertCreate):
    """Triggers silent emergency alert and dispatches notification via configured notifier."""
    maps_url = None
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

    alert = Alert(
        id=str(uuid4()),
        session_id=body.session_id,
        level=body.level,
        source=body.source,
        trigger_phrase=body.trigger_phrase,
        language=body.language,
        recipient_name=body.recipient_name,
        recipient_phone=body.recipient_phone,
        location=body.location,
        transcript_snippet=body.transcript_snippet,
        maps_url=maps_url,
        simulated_message=simulated_message,
        deliveries=deliveries,
        created_at=datetime.now(timezone.utc),
    )
    _alerts.append(alert)
    return alert
