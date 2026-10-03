from unittest.mock import AsyncMock, patch

import httpx
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from app.services.notifier import MockNotifier, TelegramNotifier, get_notifier

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_create_and_list_items():
    r = client.post("/api/v1/items", json={"name": "demo"})
    assert r.status_code == 201
    assert r.json()["name"] == "demo"
    assert any(i["name"] == "demo" for i in client.get("/api/v1/items").json())


def test_item_validation_error_format():
    r = client.post("/api/v1/items", json={"name": ""})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"


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
    assert data["session_id"] == "test-session-123"
    assert data["level"] == "alert"
    assert data["maps_url"] == "https://maps.google.com/?q=52.406374,16.925168"
    assert "https://maps.google.com/?q=52.406374,16.925168" in data["simulated_message"]
    assert len(data["deliveries"]) == 1
    assert data["deliveries"][0]["channel"] == "mock"
    assert data["deliveries"][0]["status"] == "sent"


def test_create_alert_without_location():
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
    assert data["maps_url"] is None
    assert "unavailable" in data["simulated_message"].lower()
    assert data["deliveries"][0]["status"] == "sent"


def test_list_alerts():
    r = client.get("/api/v1/alerts")
    assert r.status_code == 200
    alerts = r.json()
    assert isinstance(alerts, list)
    assert len(alerts) >= 2


def test_alert_validation_error():
    # Invalid level enum
    payload = {
        "session_id": "test-session-789",
        "level": "non_existing_level",
        "source": "keyword",
        "recipient_name": "Test",
        "recipient_phone": "+48111222333",
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"


def test_telegram_notifier_success(monkeypatch):
    monkeypatch.setattr(settings, "alert_provider", "telegram")
    monkeypatch.setattr(settings, "telegram_bot_token", "fake-token-123")
    monkeypatch.setattr(settings, "telegram_chat_id", "chat-id-456")

    mock_resp = httpx.Response(200, json={"ok": True, "result": {"message_id": 99}})
    with patch.object(httpx.AsyncClient, "post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp

        payload = {
            "session_id": "test-session-tg",
            "level": "alert",
            "source": "keyword",
            "trigger_phrase": "czy nakarmiłaś kota",
            "language": "pl",
            "recipient_name": "Mama",
            "recipient_phone": "+48123456789",
            "location": {"latitude": 52.406374, "longitude": 16.925168},
        }
        r = client.post("/api/v1/alerts", json=payload)
        assert r.status_code == 201
        data = r.json()
        assert len(data["deliveries"]) == 1
        assert data["deliveries"][0]["channel"] == "telegram"
        assert data["deliveries"][0]["status"] == "sent"

        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert "fake-token-123" in str(call_args)
        assert call_args.kwargs["json"]["chat_id"] == "chat-id-456"
        assert "52.406374,16.925168" in call_args.kwargs["json"]["text"]


def test_telegram_notifier_failure(monkeypatch):
    monkeypatch.setattr(settings, "alert_provider", "telegram")
    monkeypatch.setattr(settings, "telegram_bot_token", "fake-token-123")
    monkeypatch.setattr(settings, "telegram_chat_id", "chat-id-456")

    mock_resp = httpx.Response(400, json={"ok": False, "description": "Chat not found"})
    with patch.object(httpx.AsyncClient, "post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp

        payload = {
            "session_id": "test-session-tg-fail",
            "level": "alert",
            "source": "manual",
            "language": "en",
            "recipient_name": "Friend",
            "recipient_phone": "+48123456789",
        }
        r = client.post("/api/v1/alerts", json=payload)
        assert r.status_code == 201
        data = r.json()
        assert data["deliveries"][0]["channel"] == "telegram"
        assert data["deliveries"][0]["status"] == "failed"


def test_telegram_notifier_missing_config(monkeypatch):
    monkeypatch.setattr(settings, "alert_provider", "telegram")
    monkeypatch.setattr(settings, "telegram_bot_token", "")
    monkeypatch.setattr(settings, "telegram_chat_id", "")

    payload = {
        "session_id": "test-session-tg-noconfig",
        "level": "alert",
        "source": "manual",
        "language": "en",
        "recipient_name": "Friend",
        "recipient_phone": "+48123456789",
    }
    r = client.post("/api/v1/alerts", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["deliveries"][0]["channel"] == "telegram"
    assert data["deliveries"][0]["status"] == "failed"


def test_get_notifier_factory():
    assert isinstance(get_notifier("mock"), MockNotifier)
    assert isinstance(get_notifier("telegram"), TelegramNotifier)
    assert isinstance(get_notifier("TELEGRAM"), TelegramNotifier)
    assert isinstance(get_notifier("unknown"), MockNotifier)


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
    assert "https://maps.google.com/?q=50.064700,19.945000" in latest["maps_url"]
    assert "created_at" in latest
    assert "deliveries" in latest
    assert "simulated_message" in latest

