from fastapi import APIRouter

from app.routes.alerts import router as alerts_router
from app.routes.realtime import router as realtime_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(realtime_router)
v1_router.include_router(alerts_router)
