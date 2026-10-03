from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings

app = FastAPI(title="Backend API", version="0.1.0")
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


# --- Models ---
class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class Item(BaseModel):
    id: str
    name: str
    created_at: datetime


# --- Routes ---
@app.get("/health")
def health():
    return {"status": "ok"}


v1 = APIRouter(prefix="/api/v1")
_items: list[Item] = []  # in-memory demo storage; replace with a real DB


@v1.get("/items", response_model=list[Item])
def list_items():
    return _items


@v1.post("/items", response_model=Item, status_code=201)
def create_item(body: ItemCreate):
    item = Item(id=str(uuid4()), name=body.name, created_at=datetime.now(timezone.utc))
    _items.append(item)
    return item


app.include_router(v1)
