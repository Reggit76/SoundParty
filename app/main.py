from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.openapi.utils import get_openapi
from app.core.lifespan import lifespan
from app.routers import (
    auth_router,
    event_router,
    user_router,
    team_router,
    booking_router,
    payment_router,
    event_result_router,
    venue_router,
    participant_router,
)


app = FastAPI(
    title="Sound Party API",
    description="API для платформы Sound Party",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Подключение статики
app.mount("/static", StaticFiles(directory="static"), name="static")

# Подключение шаблонов
templates = Jinja2Templates(directory="templates")

# Подключение маршрутов
app.include_router(auth_router.router)
app.include_router(event_router.router)
app.include_router(user_router.router)
app.include_router(team_router.router)
app.include_router(booking_router.router)
app.include_router(payment_router.router)
app.include_router(event_result_router.router)
app.include_router(venue_router.router)
app.include_router(participant_router.router)

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

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    # Пример данных
    events = [
        {"description": "Музыкальный баттл", "date": "2025-04-10", "time": "19:00", "max_teams": 10, "venue_name": "Клуб Эхо"},
        {"description": "DJ Battle", "date": "2025-04-15", "time": "20:00", "max_teams": 8, "venue_name": "Сцена 2025"}
    ]
    return templates.TemplateResponse("index.html", {"request": request, "events": events})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})