import pytest
from fastapi.testclient import TestClient

from app.exceptions import UpstreamError
from app.main import app
from app.routes import alerts as alerts_route
from app.routes import realtime as realtime_route
from app.services.notifier import MockNotifier, get_notifier

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_alerts():
    alerts_route._alerts.clear()
    yield
    alerts_route._alerts.clear()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_create_realtime_session():
    r = client.post(
        "/api/v1/realtime/session",
        json={
            "session_id": "session-123",
            "language": "pl",
            "alert_phrases": ["czy nakarmiłaś kota"],
            "emergency_phrases": ["zadzwoń do dziadka"],
        },
    )
    data = r.json()
    assert r.status_code == 201
    assert data["client_secret"].startswith("ek_")
    assert data["model"] == "gpt-realtime-mini"
    assert data["expires_at"].endswith("Z")


def test_realtime_session_validation_error():
    r = client.post(
        "/api/v1/realtime/session",
        json={
            "session_id": "session-123",
            "language": "de",
            "alert_phrases": [],
            "emergency_phrases": [],
        },
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"


def test_realtime_session_upstream_error(monkeypatch):
    def boom(_: object):
        raise UpstreamError("upstream failed")

    monkeypatch.setattr(realtime_route, "issue_realtime_session", boom)
    r = client.post(
        "/api/v1/realtime/session",
        json={
            "session_id": "session-123",
            "language": "pl",
            "alert_phrases": ["czy nakarmiłaś kota"],
            "emergency_phrases": ["zadzwoń do dziadka"],
        },
    )
    assert r.status_code == 502
    assert r.json()["error"]["code"] == "UPSTREAM_ERROR"


def test_create_alert_with_location():
    payload = {
        "session_id": "test-session-123",
        "level": "alert",
        "source": "keyword",
        "trigger_phrase": "czy nakarmiłaś kota",
        "language": "pl",
        "recipient_name": "Mama",
        "recipient_phone": "+48123456789",
        "location": {
            "latitude": 52.406374,
            "longitude": 16.925168,
            "accuracy": 10.5,
        },
        "transcript_snippet": "Mamo a czy nakarmiłaś kota przed wyjściem?",
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["id"]
    assert data["maps_url"] == "https://maps.google.com/?q=52.406374,16.925168"
    assert len(data["deliveries"]) == 1
    assert data["deliveries"][0]["channel"] == "mock"
    assert data["deliveries"][0]["status"] == "sent"
    assert data["created_at"].endswith("Z")


def test_create_alert_without_location_and_trigger_phrase():
    payload = {
        "session_id": "test-session-456",
        "level": "emergency",
        "source": "manual",
        "language": "en",
        "recipient_name": "Dad",
        "recipient_phone": "+48987654321",
        "location": None,
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["maps_url"] == "location unavailable"
    assert data["deliveries"][0]["status"] == "sent"


def test_create_alert_provider_failure_returns_201_failed_delivery(monkeypatch):
    class FailedNotifier:
        async def dispatch(self, alert_data, maps_url, simulated_message):
            _ = (alert_data, maps_url, simulated_message)
            return [{"channel": "mock", "status": "failed"}]

    monkeypatch.setattr(alerts_route, "get_notifier", lambda: FailedNotifier())
    payload = {
        "session_id": "test-session-789",
        "level": "emergency",
        "source": "agent",
        "trigger_phrase": "zadzwoń do dziadka",
        "language": "pl",
        "recipient_name": "Mama",
        "recipient_phone": "+48123456789",
        "location": None,
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["deliveries"] == [{"channel": "mock", "status": "failed"}]


def test_alert_validation_errors():
    base = {
        "session_id": "test-session-789",
        "level": "alert",
        "source": "keyword",
        "recipient_name": "Test",
        "recipient_phone": "+48111222333",
        "location": None,
    }

    r = client.post("/api/v1/alerts", json={**base, "language": "de"})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"

    r = client.post(
        "/api/v1/alerts",
        json={
            "session_id": "test-session-789",
            "level": "alert",
            "source": "keyword",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": None,
        },
    )
    assert r.status_code == 422

    r = client.post("/api/v1/alerts", json={**base, "language": "pl"})
    assert r.status_code == 201

    r = client.post(
        "/api/v1/alerts",
        json={
            "session_id": "test-session-790",
            "level": "alert",
            "source": "keyword",
            "language": "pl",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": {"longitude": 16.9, "accuracy": 10.5},
        },
    )
    assert r.status_code == 422

    r = client.post(
        "/api/v1/alerts",
        json={
            "session_id": "test-session-791",
            "level": "alert",
            "source": "keyword",
            "language": "pl",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": {"latitude": 52.4, "accuracy": 10.5},
        },
    )
    assert r.status_code == 422

    r = client.post(
        "/api/v1/alerts",
        json={
            "session_id": "test-session-792",
            "level": "alert",
            "source": "keyword",
            "language": "pl",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": {"latitude": 52.4, "longitude": 16.9},
        },
    )
    assert r.status_code == 422


def test_list_alerts_shape_and_public_fields():
    client.post(
        "/api/v1/alerts",
        json={
            "session_id": "test-session-123",
            "level": "alert",
            "source": "keyword",
            "trigger_phrase": "czy nakarmiłaś kota",
            "language": "pl",
            "recipient_name": "Mama",
            "recipient_phone": "+48123456789",
            "location": {"latitude": 52.406374, "longitude": 16.925168, "accuracy": 10.5},
            "transcript_snippet": "Mamo a czy nakarmiłaś kota przed wyjściem?",
        },
    )
    client.post(
        "/api/v1/alerts",
        json={
            "session_id": "test-session-456",
            "level": "emergency",
            "source": "manual",
            "language": "en",
            "recipient_name": "Dad",
            "recipient_phone": "+48987654321",
            "location": None,
        },
    )

    r = client.get("/api/v1/alerts")
    assert r.status_code == 200
    alerts = r.json()
    assert isinstance(alerts, list)
    assert len(alerts) == 2
    assert alerts[0]["session_id"] == "test-session-456"
    assert alerts[1]["session_id"] == "test-session-123"

    public_keys = {
        "id",
        "session_id",
        "created_at",
        "level",
        "source",
        "trigger_phrase",
        "transcript_snippet",
        "location",
        "deliveries",
    }
    for alert in alerts:
        assert set(alert.keys()) == public_keys
        assert "language" not in alert
        assert "recipient_name" not in alert
        assert "recipient_phone" not in alert
        assert "maps_url" not in alert


@pytest.mark.parametrize(
    "payload",
    [
        {
            "session_id": "test-session-800",
            "level": "alert",
            "source": "keyword",
            "language": "pl",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": {"longitude": 16.9, "accuracy": 10.5},
        },
        {
            "session_id": "test-session-801",
            "level": "alert",
            "source": "keyword",
            "language": "pl",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": {"latitude": 52.4, "accuracy": 10.5},
        },
        {
            "session_id": "test-session-802",
            "level": "alert",
            "source": "keyword",
            "language": "pl",
            "recipient_name": "Test",
            "recipient_phone": "+48111222333",
            "location": {"latitude": 52.4, "longitude": 16.9},
        },
    ],
)
def test_location_fields_are_required(payload):
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 422
def test_get_notifier_returns_mock():
    assert isinstance(get_notifier(), MockNotifier)


def test_list_alerts_contains_dispatcher_fields():
    payload = {
        "session_id": "session-dispatcher-check",
        "level": "emergency",
        "source": "keyword",
        "trigger_phrase": "pomocy test",
        "language": "pl",
        "recipient_name": "Dyspozytor",
        "recipient_phone": "+48555666777",
        "location": {
            "latitude": 50.0647,
            "longitude": 19.9450,
            "accuracy": 5.0,
        },
        "transcript_snippet": "To jest fragment rozmowy: pomocy test.",
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 201

    r_list = client.get("/api/v1/alerts")
    assert r_list.status_code == 200
    alerts = r_list.json()
    assert len(alerts) > 0

    latest = alerts[0]
    assert latest["session_id"] == "session-dispatcher-check"
    assert latest["level"] == "emergency"
    assert latest["source"] == "keyword"
    assert latest["trigger_phrase"] == "pomocy test"
    assert latest["transcript_snippet"] == "To jest fragment rozmowy: pomocy test."
    assert latest["location"]["latitude"] == 50.0647
    assert latest["location"]["longitude"] == 19.9450
    assert latest["location"]["accuracy"] == 5.0
    assert "created_at" in latest
    assert "deliveries" in latest
    assert latest["deliveries"][0]["channel"] == "mock"
