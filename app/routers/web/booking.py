from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
import secrets

from app.core.security import decode_access_token
from app.core.csrf import get_csrf_token, csrf_protect_dependency
from app.repositories.user_repo import get_user_by_username
from app.repositories.booking_repo import get_all_bookings, delete_booking, create_booking
from app.repositories.team_repo import get_teams_by_user_id
from app.repositories.payment_repo import get_all_payments
from app.repositories.event_repo import get_event_by_id
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/my-bookings", response_class=HTMLResponse)
async def my_bookings_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
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
        
        # Получаем команды пользователя
        user_teams = get_teams_by_user_id(conn, current_user["user_id"])
        team_ids = [team["team_id"] for team in user_teams]
        
        # Получаем все заявки
        all_bookings = get_all_bookings(conn)
        
        # Фильтруем заявки для команд пользователя
        my_bookings = []
        for booking in all_bookings:
            # Проверяем, принадлежит ли заявка одной из команд пользователя
            for team in user_teams:
                if booking.get("team_name") == team["name"]:
                    booking["team_id"] = team["team_id"]
                    my_bookings.append(booking)
                    break
        
        # Получаем информацию о платежах
        all_payments = get_all_payments(conn)
        
        # Добавляем информацию о платежах к заявкам
        for booking in my_bookings:
            booking["payment"] = None
            for payment in all_payments:
                if payment.get("booking_id") == booking["booking_id"]:
                    booking["payment"] = payment
                    break
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("bookings/my_bookings.html", {
            "request": request,
            "current_user": current_user,
            "bookings": my_bookings,
            "csrf_token": csrf_token
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")
    finally:
        put_db(conn)

@router.post("/bookings/{booking_id}/cancel", response_class=RedirectResponse)
async def cancel_booking(
    booking_id: int,
    request: Request,
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        # Проверка авторизации
        token = request.cookies.get("access_token")
        if not token:
            return RedirectResponse("/login", status_code=302)
        
        # Здесь можно добавить проверку, что пользователь имеет право отменить заявку
        
        # Удаляем заявку
        delete_booking(conn, booking_id)
        
        return RedirectResponse("/my-bookings?success=cancelled", status_code=302)
    except Exception as e:
        return RedirectResponse("/my-bookings?error=cancel_failed", status_code=302)
    finally:
        put_db(conn)

@router.get("/my-team", response_class=HTMLResponse)
async def my_team_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
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
        
        # Получаем команды пользователя
        user_teams = get_teams_by_user_id(conn, current_user["user_id"])
        
        # Для каждой команды получаем участников
        from app.repositories.participant_repo import get_participants_by_team_id
        
        for team in user_teams:
            participants = get_participants_by_team_id(conn, team["team_id"])
            team["participants"] = participants
            team["participant_count"] = len(participants)
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("teams/my_teams.html", {
            "request": request,
            "current_user": current_user,
            "teams": user_teams,
            "csrf_token": csrf_token
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")
    finally:
        put_db(conn)

@router.get("/results", response_class=HTMLResponse)
async def results_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
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
        
        # Получаем результаты мероприятий
        from app.repositories.event_result_repo import get_event_results
        from app.repositories.event_repo import get_all_events
        
        events = get_all_events(conn)
        
        # Получаем результаты для каждого мероприятия
        events_with_results = []
        for event in events:
            try:
                results = get_event_results(conn, event["event_id"])
                if results:
                    event["results"] = results
                    events_with_results.append(event)
            except:
                pass
        
        return templates.TemplateResponse("results/list.html", {
            "request": request,
            "current_user": current_user,
            "events": events_with_results
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")
    finally:
        put_db(conn)

@router.get("/events/{event_id}/register", response_class=HTMLResponse)
async def register_event_page(event_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
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
        
        # Получаем информацию о мероприятии
        event = get_event_by_id(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        event = event[0]
        
        # Получаем команды пользователя
        user_teams = get_teams_by_user_id(conn, current_user["user_id"])
        
        # Получаем существующие бронирования для этого мероприятия
        bookings = get_all_bookings(conn)
        event_bookings = [b for b in bookings if b.get("event_id") == event_id]
        
        # Проверяем, не превышено ли максимальное количество команд
        if len(event_bookings) >= event.get("max_teams", 0):
            return RedirectResponse(f"/events/{event_id}?error=max_teams_reached", status_code=302)
        
        csrf_token = get_csrf_token(request)
        response = templates.TemplateResponse("bookings/register.html", {
            "request": request,
            "current_user": current_user,
            "event": event,
            "teams": user_teams,
            "csrf_token": csrf_token
        })
        
        # Устанавливаем session_id cookie если его нет
        if "session_id" not in request.cookies:
            session_id = secrets.token_urlsafe(32)
            response.set_cookie(
                key="session_id",
                value=session_id,
                httponly=True,
                samesite="lax"
            )
        
        return response
    finally:
        put_db(conn)

@router.post("/events/{event_id}/register", response_class=RedirectResponse)
async def register_event(
    event_id: int,
    request: Request,
    team_id: int = Form(...),
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
        
        username = payload.get("sub")
        user = get_user_by_username(conn, username)
        if not user:
            return RedirectResponse("/login", status_code=302)
        
        current_user = user[0]
        
        # Проверяем существование мероприятия
        event = get_event_by_id(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        event = event[0]
        
        # Проверяем, что команда принадлежит пользователю
        user_teams = get_teams_by_user_id(conn, current_user["user_id"])
        if not any(team["team_id"] == team_id for team in user_teams):
            return RedirectResponse(f"/events/{event_id}/register?error=invalid_team", status_code=302)
        
        # Проверяем, не зарегистрирована ли уже команда на это мероприятие
        bookings = get_all_bookings(conn)
        event_bookings = [b for b in bookings if b.get("event_id") == event_id]
        if any(b.get("team_id") == team_id for b in event_bookings):
            return RedirectResponse(f"/events/{event_id}/register?error=already_registered", status_code=302)
        
        # Проверяем, не превышено ли максимальное количество команд
        if len(event_bookings) >= event.get("max_teams", 0):
            return RedirectResponse(f"/events/{event_id}/register?error=max_teams_reached", status_code=302)
        
        # Создаем бронирование
        booking_data = {
            "event_id": event_id,
            "team_id": team_id,
            "status": "pending"  # начальный статус бронирования
        }
        
        create_booking(conn, booking_data)
        
        response = RedirectResponse("/my-bookings?success=registered", status_code=302)
        
        # Устанавливаем session_id cookie если его нет
        if "session_id" not in request.cookies:
            session_id = secrets.token_urlsafe(32)
            response.set_cookie(
                key="session_id",
                value=session_id,
                httponly=True,
                samesite="lax"
            )
        
        return response
    except Exception as e:
        return RedirectResponse(f"/events/{event_id}/register?error={str(e)}", status_code=302)
    finally:
        put_db(conn)