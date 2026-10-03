from typing import Protocol

from app.models import AlertCreate, Delivery


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
        _ = (alert_data, maps_url, simulated_message)
        return [Delivery(channel="mock", status="sent")]


def get_notifier() -> NotifierProtocol:
    return MockNotifier()
