from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
from datetime import datetime

from app.repositories.event_repo import get_all_events, get_event_by_id
from app.repositories.venue_repo import get_all_venues
from app.repositories.user_repo import get_user_by_username
from app.repositories.team_repo import get_teams_by_user_id
from app.repositories.participant_repo import get_participants_by_team_id
from app.repositories.booking_repo import get_booking_by_event_and_team, create_booking
from app.core.security import decode_access_token
from app.core.csrf import get_csrf_token, csrf_protect_dependency
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

# Для совместимости со старыми ссылками
@router.get("/event/{event_id}", response_class=HTMLResponse)
async def event_detail_page_old(event_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    return await event_detail_page(event_id, request, conn)

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

@router.get("/events/{event_id}/apply", response_class=HTMLResponse)
async def event_apply_page(event_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse("/login", status_code=302)
        
        username = payload.get("sub")
        user = get_user_by_username(conn, username)
        if not user:
            return RedirectResponse("/login", status_code=302)
        
        current_user = user[0]
        
        # Получение мероприятия
        event = get_event_by_id(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        event = event[0]
        
        # Проверка, что мероприятие не прошло
        if isinstance(event["date"], str):
            event_date = datetime.strptime(event["date"], "%Y-%m-%d").date()
        else:
            event_date = event["date"]
        
        if event_date < datetime.now().date():
            return RedirectResponse(f"/events/{event_id}?error=past", status_code=302)
        
        # Получение команд пользователя
        user_teams = get_teams_by_user_id(conn, current_user["user_id"])
        
        # Для каждой команды получаем участников и проверяем регистрацию
        for team in user_teams:
            participants = get_participants_by_team_id(conn, team["team_id"])
            team["participants"] = participants
            team["participant_count"] = len(participants)
            
            # Проверяем, зарегистрирована ли команда
            booking = get_booking_by_event_and_team(conn, event_id, team["team_id"])
            team["is_registered"] = len(booking) > 0
        
        # Максимальное количество участников от команды (например, 10)
        max_participants = 10
        
        csrf_token = get_csrf_token(request)
        
        # Обработка времени для отображения
        if isinstance(event["time"], str):
            try:
                time_obj = datetime.strptime(event["time"], "%H:%M:%S").time()
                event["formatted_time"] = time_obj.strftime("%H:%M")
            except:
                event["formatted_time"] = event["time"]
        else:
            event["formatted_time"] = str(event["time"])
        
        return templates.TemplateResponse("event_detail.html", {
            "request": request,
            "event": event,
            "current_user": current_user,
            "user_teams": user_teams,
            "max_participants": max_participants,
            "csrf_token": csrf_token
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")
    finally:
        put_db(conn)

@router.post("/event/{event_id}/register", response_class=RedirectResponse)
async def register_team_for_event(
    event_id: int,
    request: Request,
    team_id: int = Form(...),
    participants: list = Form([]),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        payload = decode_access_token(token)
        if not payload:
            return RedirectResponse("/login", status_code=302)
        
        # Проверка, что команда не зарегистрирована
        existing_booking = get_booking_by_event_and_team(conn, event_id, team_id)
        if existing_booking:
            return RedirectResponse(f"/event/{event_id}?error=already_registered", status_code=302)
        
        # Создание заявки
        booking_data = {
            "event_id": event_id,
            "team_id": team_id,
            "number_of_seats": len(participants)
        }
        
        create_booking(conn, booking_data)
        
        return RedirectResponse(f"/event/{event_id}?success=registered", status_code=302)
    except Exception as e:
        return RedirectResponse(f"/event/{event_id}?error=registration_failed", status_code=302)
    finally:
        put_db(conn)