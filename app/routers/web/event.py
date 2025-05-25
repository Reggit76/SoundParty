from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
from typing import Optional, List

from app.database import get_db, put_db
from app.templates import templates
from app.core.security import decode_access_token
from app.repositories.user_repo import get_user_by_username
from app.repositories.event_repo import get_event_by_id
from app.repositories.team_repo import get_teams_by_user_id
from app.repositories.participant_repo import get_participants_by_team_id
from app.repositories.booking_repo import create_booking, get_booking_by_event_and_team
from app.services.event_service import get_event_by_id_service

router = APIRouter(tags=["web"])

@router.get("/event/{event_id}", response_class=HTMLResponse)
async def event_detail(request: Request, event_id: int, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        # Получение информации о мероприятии
        event = get_event_by_id_service(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        event_data = event[0]
        
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
                    user_teams = get_teams_by_user_id(conn, current_user["user_id"])
                    
                    # Для каждой команды получаем участников
                    for team in user_teams:
                        participants = get_participants_by_team_id(conn, team["team_id"])
                        team["participants"] = participants
                        team["participant_count"] = len(participants)
                        
                        # Проверяем, зарегистрирована ли команда на это мероприятие
                        booking = get_booking_by_event_and_team(conn, event_id, team["team_id"])
                        team["is_registered"] = len(booking) > 0
        
        # Определяем максимальное количество участников в команде на мероприятии
        # По умолчанию 5, но можно добавить это поле в БД
        max_participants_per_team = 5
        
        return templates.TemplateResponse("event_detail.html", {
            "request": request,
            "event": event_data,
            "current_user": current_user,
            "user_teams": user_teams,
            "max_participants": max_participants_per_team
        })
    finally:
        put_db(conn)

@router.get("/logout")
def logout():
    response = RedirectResponse("/", status_code=302)
    response.delete_cookie(key="access_token")
    return response

@router.post("/event/{event_id}/register", response_class=RedirectResponse)
async def register_team_for_event(
    request: Request,
    event_id: int,
    team_id: int = Form(...),
    participants: List[int] = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db)
):
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
        
        # Проверяем, что команда принадлежит пользователю
        user_teams = get_teams_by_user_id(conn, current_user["user_id"])
        team_ids = [team["team_id"] for team in user_teams]
        
        if team_id not in team_ids:
            raise HTTPException(status_code=403, detail="У вас нет прав на регистрацию этой команды")
        
        # Проверяем, что команда еще не зарегистрирована
        existing_booking = get_booking_by_event_and_team(conn, event_id, team_id)
        if existing_booking:
            return RedirectResponse(f"/event/{event_id}?error=already_registered", status_code=302)
        
        # Создаем заявку
        booking_data = {
            "event_id": event_id,
            "team_id": team_id,
            "number_of_seats": len(participants)
        }
        
        create_booking(conn, booking_data)
        
        return RedirectResponse(f"/event/{event_id}?success=registered", status_code=302)
        
    except Exception as e:
        return RedirectResponse(f"/event/{event_id}?error={str(e)}", status_code=302)
    finally:
        put_db(conn)