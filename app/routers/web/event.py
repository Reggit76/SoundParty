from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
import psycopg2
from datetime import datetime

from app.repositories.event_repo import get_all_events, get_event_by_id
from app.repositories.venue_repo import get_all_venues
from app.repositories.user_repo import get_user_by_username
from app.core.security import decode_access_token
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/events", response_class=HTMLResponse)
async def events_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение всех мероприятий
        events = get_all_events(conn)
        current_date = datetime.now().date()

        # Добавляем флаг 'is_past' к каждому мероприятию
        for event in events:
            if isinstance(event["date"], str):
                event["date"] = datetime.strptime(event["date"], "%Y-%m-%d").date()
            event["is_past"] = event["date"] < current_date
            
            # Форматируем время для отображения
            if isinstance(event["time"], str):
                try:
                    time_obj = datetime.strptime(event["time"], "%H:%M:%S").time()
                    event["formatted_time"] = time_obj.strftime("%H:%M")
                except:
                    event["formatted_time"] = event["time"]
            else:
                event["formatted_time"] = str(event["time"])

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

        return templates.TemplateResponse("events/list.html", {
            "request": request,
            "events": events,
            "current_user": current_user,
            "page_title": "Мероприятия"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки мероприятий: {str(e)}")
    finally:
        put_db(conn)

@router.get("/events/{event_id}", response_class=HTMLResponse)
async def event_detail_page(event_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение конкретного мероприятия
        event = get_event_by_id(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        event = event[0]
        
        # Обработка даты и времени
        if isinstance(event["date"], str):
            event["date"] = datetime.strptime(event["date"], "%Y-%m-%d").date()
        
        event["is_past"] = event["date"] < datetime.now().date()
        
        if isinstance(event["time"], str):
            try:
                time_obj = datetime.strptime(event["time"], "%H:%M:%S").time()
                event["formatted_time"] = time_obj.strftime("%H:%M")
            except:
                event["formatted_time"] = event["time"]
        else:
            event["formatted_time"] = str(event["time"])

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

        return templates.TemplateResponse("events/detail.html", {
            "request": request,
            "event": event,
            "current_user": current_user,
            "page_title": f"Мероприятие: {event['description']}"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки мероприятия: {str(e)}")
    finally:
        put_db(conn)