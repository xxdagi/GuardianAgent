import logging
from typing import Protocol

import httpx

from app.config import settings
from app.models import AlertCreate, DeliveryStatus

logger = logging.getLogger("guardian.notifier")


def _mask_phone(phone: str) -> str:
    """Masks phone number for privacy in logs (e.g. +48123456789 -> +48123***789)."""
    if len(phone) > 6:
        return phone[:5] + "***" + phone[-3:]
    return phone


class NotifierProtocol(Protocol):
    async def dispatch(
        self,
        alert_data: AlertCreate,
        maps_url: str | None,
        simulated_message: str,
    ) -> list[DeliveryStatus]:
        ...


class MockNotifier:
    """
    In-memory Mock Notifier for Hackathon demo & Live Dispatcher Dashboard.
    Simulates SMS and emergency voice call delivery without real telecom costs or APIs.
    """

    async def dispatch(
        self,
        alert_data: AlertCreate,
        maps_url: str | None,
        simulated_message: str,
    ) -> list[DeliveryStatus]:
        masked_phone = _mask_phone(alert_data.recipient_phone)
        location_str = (
            f"lat={alert_data.location.latitude:.6f}, lon={alert_data.location.longitude:.6f}"
            if alert_data.location
            else "Unavailable"
        )

        # Visual log to terminal for hackathon demo
        print("\n" + "=" * 65)
        print("🚨 [MOCK SMS DISPATCHER] Silent Alert Triggered!")
        print(f"   Recipient: {alert_data.recipient_name} ({masked_phone})")
        print(f"   Level:     {alert_data.level.upper()} | Source: {alert_data.source.upper()}")
        print(f"   GPS:       {location_str}")
        if alert_data.trigger_phrase:
            print(f"   Trigger:   \"{alert_data.trigger_phrase}\"")
        print(f"   SMS Body:  \"{simulated_message}\"")
        if maps_url:
            print(f"   Maps Link: {maps_url}")

        if alert_data.level == "emergency":
            print("   📞 [SIMULATED VOICE CALL] Auto-dialing contact with synthesized voice alert...")
            print("   📞 [SIMULATED VOICE CALL] Status: Connected (Simulation)")

        print("   ✅ Status:   SMS DISPATCHED (Mock Delivery Successful)")
        print("=" * 65 + "\n", flush=True)

        deliveries = [DeliveryStatus(channel="mock", status="sent")]
        return deliveries


class TelegramNotifier:
    """
    Telegram Bot Notifier for push notifications fallback.
    Sends alert message via Telegram Bot API using httpx.
    """

    def __init__(self, bot_token: str | None = None, chat_id: str | None = None):
        self.bot_token = bot_token if bot_token is not None else settings.telegram_bot_token
        self.chat_id = chat_id if chat_id is not None else settings.telegram_chat_id

    async def dispatch(
        self,
        alert_data: AlertCreate,
        maps_url: str | None,
        simulated_message: str,
    ) -> list[DeliveryStatus]:
        masked_phone = _mask_phone(alert_data.recipient_phone)
        location_str = (
            f"lat={alert_data.location.latitude:.6f}, lon={alert_data.location.longitude:.6f}"
            if alert_data.location
            else "Unavailable"
        )

        print("\n" + "=" * 65)
        print("🚨 [TELEGRAM DISPATCHER] Silent Alert Triggered!")
        print(f"   Recipient: {alert_data.recipient_name} ({masked_phone})")
        print(f"   Level:     {alert_data.level.upper()} | Source: {alert_data.source.upper()}")
        print(f"   GPS:       {location_str}")
        if alert_data.trigger_phrase:
            print(f"   Trigger:   \"{alert_data.trigger_phrase}\"")
        print(f"   Message:   \"{simulated_message}\"")

        if not self.bot_token or not self.chat_id:
            logger.error("Telegram bot token or chat ID is not configured")
            print("   ❌ Status:   TELEGRAM FAILED (Missing token or chat_id)")
            print("=" * 65 + "\n", flush=True)
            return [DeliveryStatus(channel="telegram", status="failed")]

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": simulated_message,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    logger.error("Telegram API returned HTTP %s", response.status_code)
                    print(f"   ❌ Status:   TELEGRAM FAILED (HTTP {response.status_code})")
                    print("=" * 65 + "\n", flush=True)
                    return [DeliveryStatus(channel="telegram", status="failed")]

                data = response.json()
                if not data.get("ok"):
                    logger.error("Telegram API returned ok=false: %s", data.get("description"))
                    print(f"   ❌ Status:   TELEGRAM FAILED ({data.get('description')})")
                    print("=" * 65 + "\n", flush=True)
                    return [DeliveryStatus(channel="telegram", status="failed")]

                print("   ✅ Status:   TELEGRAM MESSAGE SENT (Delivery Successful)")
                print("=" * 65 + "\n", flush=True)
                return [DeliveryStatus(channel="telegram", status="sent")]
        except Exception as e:  # noqa: BLE001
            logger.error("Telegram alert dispatch failed: %s", type(e).__name__)
            print(f"   ❌ Status:   TELEGRAM FAILED ({type(e).__name__})")
            print("=" * 65 + "\n", flush=True)
            return [DeliveryStatus(channel="telegram", status="failed")]


def get_notifier(provider: str | None = None) -> NotifierProtocol:
    selected = (provider or settings.alert_provider).strip().lower()
    if selected == "telegram":
        return TelegramNotifier()
    return MockNotifier()
