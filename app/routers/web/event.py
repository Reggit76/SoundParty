# app/routers/web/event.py
from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
from datetime import datetime

from app.core.security import decode_access_token
from app.core.csrf import get_csrf_token, csrf_protect_dependency
from app.repositories.event_repo import get_event_by_id
from app.repositories.booking_repo import get_all_bookings, create_booking
from app.repositories.team_repo import get_all_teams
from app.repositories.participant_repo import get_all_participants
from app.repositories.user_repo import get_user_by_username
from app.repositories.event_result_repo import get_event_results
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/event/{event_id}", response_class=HTMLResponse)
def event_detail_page(event_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получаем информацию о мероприятии
        event_data = get_event_by_id(conn, event_id)
        if not event_data:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        event = event_data[0]
        
        # Преобразуем дату для отображения
        if isinstance(event["date"], str):
            event["date"] = datetime.strptime(event["date"], "%Y-%m-%d").date()
        
        event["is_past"] = event["date"] < datetime.now().date()
        
        # Получаем заявки на это мероприятие
        all_bookings = get_all_bookings(conn)
        event_bookings = [b for b in all_bookings if b.get("event_name") == event["description"]]
        
        # Получаем результаты, если мероприятие завершено
        event_results = []
        if event["is_past"]:
            try:
                results = get_event_results(conn, event_id)
                event_results = sorted(results, key=lambda x: x.get("score", 0), reverse=True)
            except:
                pass
        
        # Проверка авторизации
        token = request.cookies.get("access_token")
        current_user = None
        user_teams = []
        
        if token:
            payload = decode_access_token(token)
            if payload:
                username = payload.get("sub")
                user = get_user_by_username(conn, username)
                if user:
                    current_user = user[0]
                    
                    # Получаем команды пользователя
                    all_participants = get_all_participants(conn)
                    for participant in all_participants:
                        if participant.get("username") == current_user["username"]:
                            teams = get_all_teams(conn)
                            for team in teams:
                                if team["name"] == participant["team_name"]:
                                    user_teams.append(team)
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("event_detail.html", {
            "request": request,
            "event": event,
            "event_bookings": event_bookings,
            "event_results": event_results,
            "current_user": current_user,
            "user_teams": user_teams,
            "csrf_token": csrf_token,
            "bookings_count": len(event_bookings)
        })
    finally:
        put_db(conn)

@router.post("/event/{event_id}/book", response_class=RedirectResponse)
def book_event(
    event_id: int,
    request: Request,
    team_id: int = Form(...),
    number_of_seats: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        # Создаем заявку
        booking_data = {
            "event_id": event_id,
            "team_id": team_id,
            "number_of_seats": number_of_seats
        }
        
        create_booking(conn, booking_data)
        
        return RedirectResponse(f"/event/{event_id}?success=1", status_code=302)
    except Exception as e:
        return RedirectResponse(f"/event/{event_id}?error=1", status_code=302)
    finally:
        put_db(conn)