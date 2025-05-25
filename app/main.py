from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

# Локальные импорты
from app.core.lifespan import lifespan
from app.core.csrf import init_csrf
from app.config import settings

# API роутеры
from app.routers.api import (
    auth as api_auth,
    user as api_user,
    role as api_role,
    venue as api_venue,
    event as api_event,
    team as api_team,
    participant as api_participant,
    booking as api_booking,
    payment as api_payment,
    event_result as api_event_result
)

# Веб роутеры
from app.routers.web import (
    auth as web_auth,
    home as web_home,
    admin as web_admin,
    event as web_event,
    profile as web_profile,
    rating as web_rating,
    teams as web_teams,
    venues as web_venues,
    booking as web_booking
)

app = FastAPI(
    title="Sound Party",
    description="API и веб-интерфейс для Sound Party",
    version="1.0.0",
    lifespan=lifespan
)

# Инициализация CSRF защиты
init_csrf(settings.SECRET_KEY)

# Статика и шаблоны
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Подключение API маршрутов ---
app.include_router(api_auth.router, prefix="/api", tags=["auth"])
app.include_router(api_user.router, prefix="/api", tags=["users"])
app.include_router(api_role.router, prefix="/api", tags=["roles"])
app.include_router(api_venue.router, prefix="/api", tags=["venues"])
app.include_router(api_event.router, prefix="/api", tags=["events"])
app.include_router(api_team.router, prefix="/api", tags=["teams"])
app.include_router(api_participant.router, prefix="/api", tags=["participants"])
app.include_router(api_booking.router, prefix="/api", tags=["bookings"])
app.include_router(api_payment.router, prefix="/api", tags=["payments"])
app.include_router(api_event_result.router, prefix="/api", tags=["event_results"])

# --- Подключение веб-маршрутов ---
app.include_router(web_home.router)
app.include_router(web_auth.router)
app.include_router(web_admin.router)
app.include_router(web_event.router)
app.include_router(web_rating.router)
app.include_router(web_profile.router)
app.include_router(web_teams.router)
app.include_router(web_venues.router)
app.include_router(web_booking.router)

# --- Настройка OpenAPI ---
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Sound Party API",
        version="1.0.0",
        description="API для Sound Party",
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