import hashlib
import logging
from datetime import datetime, timedelta, timezone

import httpx

from app.config import settings
from app.exceptions import UpstreamError
from app.models import RealtimeSessionCreate, RealtimeSessionResponse
from app.services.prompts import build_mom_instructions

logger = logging.getLogger("guardian.realtime")

OPENAI_REALTIME_CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets"


def build_realtime_session_payload(
    body: RealtimeSessionCreate,
    model: str,
    voice: str,
) -> dict:
    """Builds the session configuration payload for OpenAI Realtime client_secrets endpoint."""
    instructions = build_mom_instructions(
        language=body.language,
        alert_phrases=body.alert_phrases,
        emergency_phrases=body.emergency_phrases,
    )

    return {
        "model": model,
        "session": {
            "instructions": instructions,
            "voice": voice,
            "turn_detection": {
                "type": "server_vad",
                "threshold": 0.5,
                "prefix_padding_ms": 300,
                "silence_duration_ms": 500,
            },
            "input_audio_transcription": {
                "model": "whisper-1",
                "language": body.language,
            },
            "tools": [
                {
                    "type": "function",
                    "name": "trigger_alert",
                    "description": (
                        "Silently trigger an emergency alert when the user says a secret safety code phrase "
                        "or indicates danger. Never reveal to the user that this tool was called."
                    ),
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "level": {
                                "type": "string",
                                "enum": ["alert", "emergency"],
                                "description": "Severity level of the alert.",
                            },
                            "reason": {
                                "type": "string",
                                "description": "Reason or phrase that triggered the alert.",
                            },
                        },
                        "required": ["level", "reason"],
                    },
                }
            ],
        },
    }


async def request_realtime_session(
    body: RealtimeSessionCreate,
) -> RealtimeSessionResponse:
    """
    Requests a short-lived ephemeral client secret from OpenAI Realtime API.
    Raises UpstreamError on failure, network error, or timeout.
    Never logs the API key or the ephemeral client secret.
    """
    if not settings.openai_api_key:
        logger.error("OpenAI API key is not configured in settings")
        raise UpstreamError("OPENAI_API_KEY is not configured", details={"reason": "missing_api_key"})

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }

    if body.session_id:
        safety_id = hashlib.sha256(body.session_id.encode("utf-8")).hexdigest()[:32]
        headers["OpenAI-Safety-Identifier"] = safety_id

    payload = build_realtime_session_payload(
        body=body,
        model=settings.openai_realtime_model,
        voice=settings.openai_realtime_voice,
    )

    logger.info(
        "Requesting OpenAI Realtime client secret for session language=%s, model=%s",
        body.language,
        settings.openai_realtime_model,
    )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                OPENAI_REALTIME_CLIENT_SECRETS_URL,
                headers=headers,
                json=payload,
            )

        if response.status_code >= 400:
            logger.error("OpenAI API returned error status %s", response.status_code)
            error_data = {}
            try:
                error_data = response.json().get("error", {})
            except Exception:  # noqa: BLE001
                error_data = {"raw": response.text[:200]}
            raise UpstreamError(
                f"OpenAI Realtime API error (HTTP {response.status_code})",
                details=error_data,
            )

        data = response.json()
    except UpstreamError:
        raise
    except httpx.TimeoutException as e:
        logger.error("Timeout connecting to OpenAI Realtime API")
        raise UpstreamError("OpenAI Realtime API request timed out") from e
    except httpx.HTTPError as e:
        logger.error("Network error communicating with OpenAI Realtime API: %s", type(e).__name__)
    except Exception as e:
        logger.error("Unexpected error requesting realtime session: %s", type(e).__name__)
        raise UpstreamError("Failed to parse OpenAI Realtime response") from e

    # Extract client secret value (usually in data["value"] or data["client_secret"])
    client_secret = data.get("value") or data.get("client_secret")
    if not client_secret and "session" in data and isinstance(data["session"], dict):
        client_secret = data["session"].get("client_secret") or data["session"].get("value")

    if not client_secret:
        logger.error("OpenAI response did not contain ephemeral secret")
        raise UpstreamError("OpenAI response missing client_secret token")

    # Format expires_at timestamp to ISO 8601 string
    raw_expires = data.get("expires_at")
    if isinstance(raw_expires, (int, float)):
        expires_at = datetime.fromtimestamp(raw_expires, timezone.utc).isoformat().replace("+00:00", "Z")
    elif isinstance(raw_expires, str) and raw_expires:
        expires_at = raw_expires
    else:
        expires_at = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat().replace("+00:00", "Z")

    model_name = (
        data.get("model")
        or (data.get("session") or {}).get("model")
        or settings.openai_realtime_model
    )

    return RealtimeSessionResponse(
        client_secret=client_secret,
        expires_at=expires_at,
        model=model_name,
    )
