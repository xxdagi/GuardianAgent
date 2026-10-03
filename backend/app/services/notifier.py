import logging
from typing import Protocol

from app.models import AlertCreate, Delivery

logger = logging.getLogger("guardian.notifier")


def _mask_phone(phone: str) -> str:
    if len(phone) > 6:
        return phone[:5] + "***" + phone[-3:]
    return phone


class NotifierProtocol(Protocol):
    async def dispatch(
        self,
        alert_data: AlertCreate,
        maps_url: str,
        simulated_message: str,
    ) -> list[Delivery]:
        ...


class MockNotifier:
    """
    In-memory Mock Notifier for Hackathon demo & Live Dispatcher Dashboard.
    Simulates SMS and emergency voice call delivery without real telecom costs or APIs.

    NOTE: Telegram notifier was removed as unnecessary per product decision;
    we exclusively use MockNotifier + Live Dispatcher Dashboard for the demo.
    """

    async def dispatch(
        self,
        alert_data: AlertCreate,
        maps_url: str,
        simulated_message: str,
    ) -> list[Delivery]:
        masked_phone = _mask_phone(alert_data.recipient_phone)
        location_str = (
            f"lat={alert_data.location.latitude:.6f}, lon={alert_data.location.longitude:.6f}"
            if alert_data.location
            else "Unavailable"
        )

        logger.info(
            "mock alert dispatched",
            extra={
                "recipient_phone": masked_phone,
                "level": alert_data.level,
                "source": alert_data.source,
                "maps_url": maps_url,
                "message_preview": simulated_message[:80],
            },
        )

        # Visual log to terminal for hackathon demo
        print("\n" + "=" * 65)
        print("[MOCK SMS DISPATCHER] Silent Alert Triggered!")
        print(f"   Recipient: {alert_data.recipient_name} ({masked_phone})")
        print(f"   Level:     {alert_data.level.upper()} | Source: {alert_data.source.upper()}")
        print(f"   GPS:       {location_str}")
        if alert_data.trigger_phrase:
            print(f"   Trigger:   \"{alert_data.trigger_phrase}\"")
        try:
            print(f"   SMS Body:  \"{simulated_message}\"")
        except UnicodeEncodeError:
            print(f"   SMS Body:  \"{simulated_message.encode('ascii', 'replace').decode('ascii')}\"")
        if maps_url:
            print(f"   Maps Link: {maps_url}")
        print("   [OK] Status: SMS DISPATCHED (Mock Delivery Successful)")
        print("   [INFO] Note: Silent SMS only -- NO emergency services (112) or voice calls are triggered.")
        print("=" * 65 + "\n", flush=True)

        return [Delivery(channel="mock", status="sent")]


def get_notifier() -> NotifierProtocol:
    """
    Returns the active notifier strategy.
    Exclusively MockNotifier for Hackathon demo & Live Dispatcher Feed.
    """
    return MockNotifier()
