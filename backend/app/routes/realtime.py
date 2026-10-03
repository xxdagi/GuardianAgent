import inspect

from fastapi import APIRouter

from app.models import RealtimeSessionCreate, RealtimeSessionResponse
from app.services.realtime import request_realtime_session

router = APIRouter(prefix="/realtime", tags=["realtime"])


async def issue_realtime_session(body: RealtimeSessionCreate) -> RealtimeSessionResponse:
    return await request_realtime_session(body)


@router.post("/session", response_model=RealtimeSessionResponse, status_code=201)
async def create_realtime_session(body: RealtimeSessionCreate):
    result = issue_realtime_session(body)
    if inspect.isawaitable(result):
        return await result
    return result
