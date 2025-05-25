from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import HTMLResponse
import psycopg2

from app.repositories.venue_repo import get_all_venues, get_venue_by_id
from app.repositories.event_repo import get_all_events
from app.repositories.user_repo import get_user_by_username
from app.core.security import decode_access_token
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/venues", response_class=HTMLResponse)
async def venues_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение всех площадок
        venues = get_all_venues(conn)
        
        # Получение всех мероприятий для подсчета
        events = get_all_events(conn)
        
        # Подсчитываем количество мероприятий для каждой площадки
        venue_events = {}
        for event in events:
            venue_name = event.get("venue_name")
            if venue_name not in venue_events:
                venue_events[venue_name] = 0
            venue_events[venue_name] += 1
        
        # Добавляем количество мероприятий к площадкам
        for venue in venues:
            venue["events_count"] = venue_events.get(venue["name"], 0)

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

        return templates.TemplateResponse("venues/list.html", {
            "request": request,
            "venues": venues,
            "current_user": current_user,
            "page_title": "Площадки"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки площадок: {str(e)}")
    finally:
        put_db(conn)

@router.get("/venues/{venue_id}", response_class=HTMLResponse)
async def venue_detail_page(venue_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение конкретной площадки
        venue = get_venue_by_id(conn, venue_id)
        if not venue:
            raise HTTPException(status_code=404, detail="Площадка не найдена")
        
        venue = venue[0]
        
        # Получение мероприятий для этой площадки
        all_events = get_all_events(conn)
        venue_events = [event for event in all_events if event.get("venue_name") == venue["name"]]
        venue["events"] = venue_events
        venue["events_count"] = len(venue_events)

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

        return templates.TemplateResponse("venues/detail.html", {
            "request": request,
            "venue": venue,
            "current_user": current_user,
            "page_title": f"Площадка: {venue['name']}"
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки площадки: {str(e)}")
    finally:
        put_db(conn)