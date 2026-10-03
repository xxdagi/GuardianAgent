from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.routes import v1_router
from app.routes.health import router as health_router

app = FastAPI(title="Guardian Agent Backend API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Unified error format (see contracts/backend.openapi.yaml) ---
def error_response(status: int, code: str, message: str, details: dict | None = None):
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "details": details or {}}},
    )


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    return error_response(
        422, "VALIDATION_ERROR", "Invalid request", {"errors": jsonable_encoder(exc.errors())}
    )


@app.exception_handler(StarletteHTTPException)
async def http_handler(_: Request, exc: StarletteHTTPException):
    code = "NOT_FOUND" if exc.status_code == 404 else "INTERNAL_ERROR"
    return error_response(exc.status_code, code, str(exc.detail))


# --- Register Routers ---
app.include_router(health_router)
app.include_router(v1_router)
