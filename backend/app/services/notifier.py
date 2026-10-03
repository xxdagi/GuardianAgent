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
    async def dispatch(
        self,
        alert_data: AlertCreate,
        maps_url: str,
        simulated_message: str,
    ) -> list[Delivery]:
        logger.info(
            "mock alert dispatched",
            extra={
                "recipient_phone": _mask_phone(alert_data.recipient_phone),
                "level": alert_data.level,
                "source": alert_data.source,
                "maps_url": maps_url,
                "message_preview": simulated_message[:80],
            },
        )
        return [Delivery(channel="mock", status="sent")]


def get_notifier() -> NotifierProtocol:
    return MockNotifier()
