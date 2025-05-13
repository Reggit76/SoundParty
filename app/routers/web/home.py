from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
import psycopg2
from datetime import datetime

from app.core.dependencies import get_current_user_data
from app.repositories.event_repo import get_all_events
from app.repositories.user_repo import get_user_by_username
from app.core.security import decode_access_token
from app.database import get_db, put_db
from app.templates import templates

# Создайте роутер
router = APIRouter(tags=["web"])

@router.get("/", response_class=HTMLResponse)
async def home(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение мероприятий из БД
        events = get_all_events(conn)
        current_date = datetime.now().date()

        # Добавляем флаг 'is_past' к каждому мероприятию
        for event in events:
            if isinstance(event["date"], str):
                # Преобразуем строку в объект date, если дата пришла как строка
                event["date"] = datetime.strptime(event["date"], "%Y-%m-%d").date()
            event["is_past"] = event["date"] < current_date

        # Проверка авторизации
        token = request.cookies.get("access_token")
        current_user = None
        if token:
            payload = decode_access_token(token)
            if payload:
                username = payload.get("sub")
                user = get_user_by_username(conn, username)
                if user:
                    current_user = user[0]

        # Рендеринг главной страницы
        return templates.TemplateResponse("index.html", {
            "request": request,
            "events": events,
            "current_user": current_user
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки мероприятий: {str(e)}")
    finally:
        put_db(conn)