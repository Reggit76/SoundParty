from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

# Локальные импорты
from app.core.lifespan import lifespan
from app.routers.api import auth as api_auth
from app.routers.web import auth as web_auth
from app.routers.web import home as web_home
from app.routers.web import admin as web_admin
from app.routers.web import (
    event as web_event,
    profile as web_profile,
    rating as web_rating
)

app = FastAPI(
    title="Sound Party",
    description="API и веб-интерфейс для Sound Party",
    version="1.0.0",
    lifespan=lifespan
)

# Статика и шаблоны
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Подключение маршрутов ---
# API маршруты
app.include_router(api_auth.router, prefix="/api")

# Веб-маршруты
app.include_router(web_home.router)
app.include_router(web_auth.router)
app.include_router(web_admin.router)
app.include_router(web_event.router)
app.include_router(web_rating.router)
app.include_router(web_profile.router)

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