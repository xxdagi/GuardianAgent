from fastapi import APIRouter

from app.routes.items import router as items_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(items_router)
