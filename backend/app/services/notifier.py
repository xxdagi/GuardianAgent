import logging
from typing import Protocol

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


def get_notifier() -> NotifierProtocol:
    # Future providers (e.g. Telegram) can be plugged in here based on settings.alert_provider
    return MockNotifier()
