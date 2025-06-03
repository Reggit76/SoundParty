from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.database import init_db_pool
from app.config import settings

# API routers
from app.api.v1 import (
    auth as api_auth,
    user as api_user,
    role as api_role,
    venue as api_venue,
    event as api_event,
    team as api_team,
    participant as api_participant,
    booking as api_booking,
    payment as api_payment,
    event_result as api_event_result,
    profile as api_profile
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database pool
    init_db_pool()
    yield
    # Cleanup (if needed)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sound Party API - Backend Service",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router with version prefix
api_router = APIRouter(prefix="/api/v1")

# Include all API routes - УБИРАЕМ prefix из auth роутера
api_router.include_router(api_auth.router, tags=["auth"])
api_router.include_router(api_user.router, tags=["users"])
api_router.include_router(api_role.router, tags=["roles"])
api_router.include_router(api_venue.router, tags=["venues"])
api_router.include_router(api_event.router, tags=["events"])
api_router.include_router(api_team.router, tags=["teams"])
api_router.include_router(api_participant.router, tags=["participants"])
api_router.include_router(api_booking.router, tags=["bookings"])
api_router.include_router(api_payment.router, tags=["payments"])
api_router.include_router(api_event_result.router, tags=["event_results"])
api_router.include_router(api_profile.router, tags=["profile"])

# Configure OpenAPI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Sound Party API",
        version="1.0.0",
        description="REST API for Sound Party Application",
        routes=app.routes
    )

    openapi_schema["components"]["securitySchemes"] = {
        "Bearer Auth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    openapi_schema["security"] = [{"Bearer Auth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Include the API router
app.include_router(api_router)