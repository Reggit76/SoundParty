# app/routers/web/admin.py
from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
from datetime import datetime
from typing import Optional
import secrets

from app.core.security import decode_access_token, hash_password
from app.core.csrf import get_csrf_token, csrf_protect_dependency
from app.repositories.user_repo import get_user_by_username, get_all_users, delete_user, create_user, update_user
from app.repositories.event_repo import get_all_events, create_event, delete_event, update_event, get_event_by_id
from app.repositories.venue_repo import get_all_venues, create_venue, delete_venue, update_venue, get_venue_by_id
from app.repositories.team_repo import get_all_teams, delete_team, get_team_by_id, update_team, create_team
from app.repositories.booking_repo import get_all_bookings, delete_booking, get_booking_by_id
from app.repositories.payment_repo import get_all_payments, update_payment_status, get_payment_by_id
from app.repositories.participant_repo import get_all_participants, get_participants_by_team_id
from app.repositories.event_result_repo import create_event_result, get_event_results
from app.database import get_db, put_db
from app.services.user_service import get_user_by_id_service
from app.templates import templates

router = APIRouter(tags=["admin"], prefix="/admin")

def check_admin_access(request: Request, conn: psycopg2.extensions.connection):
    """Проверяет, является ли пользователь администратором"""
    token = request.cookies.get("access_token")
    if not token:
        return None
    
    payload = decode_access_token(token)
    if not payload:
        return None
    
    username = payload.get("sub")
    user = get_user_by_username(conn, username)
    
    if not user or user[0]["role_id"] != 1:  # 1 - ID роли администратора
        return None
    
    return user[0]

@router.get("", response_class=HTMLResponse)
def admin_dashboard(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        # Получаем статистику
        users = get_all_users(conn)
        events = get_all_events(conn)
        venues = get_all_venues(conn)
        teams = get_all_teams(conn)
        bookings = get_all_bookings(conn)
        payments = get_all_payments(conn)
        
        # Подсчитываем пользователей по ролям
        admin_count = len([u for u in users if u.get("role_id") == 1])
        organizer_count = len([u for u in users if u.get("role_id") == 2])
        participant_count = len([u for u in users if u.get("role_id") == 3])
        
        # Подсчитываем платежи
        paid_payments = len([p for p in payments if p.get("payment_status") == "оплачено"])
        pending_payments = len(payments) - paid_payments
        
        stats = {
            "users_count": len(users),
            "events_count": len(events),
            "venues_count": len(venues),
            "teams_count": len(teams),
            "bookings_count": len(bookings),
            "payments_count": len(payments),
            "paid_payments": paid_payments,
            "pending_payments": pending_payments,
            "admin_count": admin_count,
            "organizer_count": organizer_count,
            "participant_count": participant_count
        }
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/dashboard.html", {
            "request": request,
            "current_user": current_user,
            "stats": stats,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===

@router.get("/users", response_class=HTMLResponse)
def admin_users(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        users = get_all_users(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/users.html", {
            "request": request,
            "current_user": current_user,
            "users": users,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/users/create", response_class=HTMLResponse)
def admin_users_create_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/users/create.html", {
            "request": request,
            "current_user": current_user,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/users/create", response_class=RedirectResponse)
def admin_users_create(
    request: Request,
    username: str = Form(...),
    fullname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role_id: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        # Проверяем, что пользователь с таким именем не существует
        existing_user = get_user_by_username(conn, username)
        if existing_user:
            csrf_token_new = get_csrf_token(request)
            return templates.TemplateResponse("admin/users/create.html", {
                "request": request,
                "current_user": current_user,
                "csrf_token": csrf_token_new,
                "error": "Пользователь с таким именем уже существует"
            })
        
        user_data = {
            "username": username,
            "fullname": fullname,
            "email": email,
            "password_hash": hash_password(password),
            "role_id": role_id
        }
        
        create_user(conn, user_data)
        
        return RedirectResponse("/admin/users?success=created", status_code=302)
    finally:
        put_db(conn)

@router.get("/users/{user_id}/edit", response_class=HTMLResponse)
def admin_users_edit_page(user_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        user = get_user_by_id_service(conn, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/users/edit.html", {
            "request": request,
            "current_user": current_user,
            "user": user[0],
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/users/{user_id}/edit", response_class=RedirectResponse)
def admin_users_edit(
    user_id: int,
    request: Request,
    username: str = Form(...),
    fullname: str = Form(...),
    email: str = Form(...),
    role_id: int = Form(...),
    password: Optional[str] = Form(None),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        user_data = {
            "username": username,
            "fullname": fullname,
            "email": email,
            "role_id": role_id
        }
        
        # Если пароль указан, обновляем его
        if password:
            user_data["password_hash"] = hash_password(password)
        else:
            # Получаем текущий пароль
            current_user_data = get_user_by_id_service(conn, user_id)
            
            if current_user_data:
                user_data["password_hash"] = current_user_data[0]["password_hash"]
        
        update_user(conn, user_id, user_data)
        
        return RedirectResponse("/admin/users?success=updated", status_code=302)
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ МЕРОПРИЯТИЯМИ ===

@router.get("/events", response_class=HTMLResponse)
def admin_events(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        events = get_all_events(conn)
        venues = get_all_venues(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/events.html", {
            "request": request,
            "current_user": current_user,
            "events": events,
            "venues": venues,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/events/create", response_class=HTMLResponse)
def admin_events_create_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        venues = get_all_venues(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/events/create.html", {
            "request": request,
            "current_user": current_user,
            "venues": venues,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/events/create", response_class=RedirectResponse)
def admin_events_create(
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    event_date: str = Form(...),
    event_time: str = Form(...),
    venue_id: int = Form(...),
    max_teams: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        event_data = {
            "description": name,  # используем name как description
            "venue_id": venue_id,
            "date": event_date,
            "time": event_time,
            "max_teams": max_teams,
            "status": "анонс"  # используем правильное значение из enum
        }
        
        create_event(conn, event_data)
        
        return RedirectResponse("/admin/events?success=created", status_code=302)
    finally:
        put_db(conn)

@router.get("/events/{event_id}/edit", response_class=HTMLResponse)
def admin_events_edit_page(event_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        event = get_event_by_id(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        venues = get_all_venues(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/events/edit.html", {
            "request": request,
            "current_user": current_user,
            "event": event[0],
            "venues": venues,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/events/{event_id}/edit", response_class=RedirectResponse)
def admin_events_edit(
    event_id: int,
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    event_date: str = Form(...),
    event_time: str = Form(...),
    venue_id: int = Form(...),
    max_teams: int = Form(...),
    status: str = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        event_data = {
            "description": name,  # используем name как description
            "venue_id": venue_id,
            "date": event_date,
            "time": event_time,
            "max_teams": max_teams,
            "status": status
        }
        
        update_event(conn, event_id, event_data)
        
        return RedirectResponse("/admin/events?success=updated", status_code=302)
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ ПЛОЩАДКАМИ ===

@router.get("/venues", response_class=HTMLResponse)
def admin_venues(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        venues = get_all_venues(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/venues.html", {
            "request": request,
            "current_user": current_user,
            "venues": venues,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/venues/create", response_class=HTMLResponse)
def admin_venues_create_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        csrf_token = get_csrf_token(request)
        
        response = templates.TemplateResponse("admin/venues/create.html", {
            "request": request,
            "current_user": current_user,
            "csrf_token": csrf_token
        })
        
        # Set session_id cookie if it doesn't exist
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

@router.post("/venues/create", response_class=RedirectResponse)
def create_venue_admin(
    request: Request,
    name: str = Form(...),
    address: str = Form(...),
    capacity: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        venue_data = {
            "name": name,
            "address": address,
            "capacity": capacity
        }
        
        create_venue(conn, venue_data)
        
        return RedirectResponse("/admin/venues?success=1", status_code=302)
    finally:
        put_db(conn)

@router.get("/venues/{venue_id}/edit", response_class=HTMLResponse)
def admin_venues_edit_page(venue_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        venue = get_venue_by_id(conn, venue_id)
        if not venue:
            raise HTTPException(status_code=404, detail="Площадка не найдена")
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/venues/edit.html", {
            "request": request,
            "current_user": current_user,
            "venue": venue[0],
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/venues/{venue_id}/edit", response_class=RedirectResponse)
def admin_venues_edit(
    venue_id: int,
    request: Request,
    name: str = Form(...),
    address: str = Form(...),
    capacity: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        venue_data = {
            "name": name,
            "address": address,
            "capacity": capacity
        }
        
        update_venue(conn, venue_id, venue_data)
        
        return RedirectResponse("/admin/venues?success=updated", status_code=302)
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ КОМАНДАМИ ===

@router.get("/teams", response_class=HTMLResponse)
def admin_teams(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        teams = get_all_teams(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/teams.html", {
            "request": request,
            "current_user": current_user,
            "teams": teams,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/teams/create", response_class=HTMLResponse)
def admin_teams_create_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/teams/create.html", {
            "request": request,
            "current_user": current_user,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/teams/create", response_class=RedirectResponse)
def admin_teams_create(
    request: Request,
    name: str = Form(...),
    rating: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        team_data = {
            "name": name,
            "rating": rating
        }
        
        create_team(conn, team_data)
        
        return RedirectResponse("/admin/teams?success=created", status_code=302)
    finally:
        put_db(conn)

@router.get("/teams/{team_id}/edit", response_class=HTMLResponse)
def admin_teams_edit_page(team_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        team = get_team_by_id(conn, team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Команда не найдена")
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/teams/edit.html", {
            "request": request,
            "current_user": current_user,
            "team": team[0],
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/admin/teams/{team_id}/edit", response_class=RedirectResponse)
def admin_teams_edit(
    team_id: int,
    request: Request,
    name: str = Form(...),
    rating: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        team_data = {
            "name": name,
            "rating": rating
        }
        
        update_team(conn, team_id, team_data)
        
        return RedirectResponse("/admin/teams?success=updated", status_code=302)
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ ===

@router.get("/bookings", response_class=HTMLResponse)
def admin_bookings(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        bookings = get_all_bookings(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/bookings.html", {
            "request": request,
            "current_user": current_user,
            "bookings": bookings,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/bookings/{booking_id}", response_class=HTMLResponse)
def admin_booking_details(booking_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        booking = get_booking_by_id(conn, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Бронирование не найдено")
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/bookings/details.html", {
            "request": request,
            "current_user": current_user,
            "booking": booking[0],
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ ПЛАТЕЖАМИ ===

@router.get("/payments", response_class=HTMLResponse)
def admin_payments(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        payments = get_all_payments(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/payments.html", {
            "request": request,
            "current_user": current_user,
            "payments": payments,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/payments/{payment_id}", response_class=HTMLResponse)
def admin_payment_details(payment_id: int, request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        payment = get_payment_by_id(conn, payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Платеж не найден")
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/payments/details.html", {
            "request": request,
            "current_user": current_user,
            "payment": payment[0],
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/payments/{payment_id}/update_status", response_class=RedirectResponse)
def admin_payments_update_status(
    payment_id: int,
    request: Request,
    status: str = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        update_payment_status(conn, payment_id, status)
        
        return RedirectResponse("/admin/payments?success=updated", status_code=302)
    finally:
        put_db(conn)

# === ОТЧЕТЫ ===

@router.get("/reports", response_class=HTMLResponse)
def admin_reports(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        # Получаем данные для отчетов
        users = get_all_users(conn)
        events = get_all_events(conn)
        venues = get_all_venues(conn)
        teams = get_all_teams(conn)
        bookings = get_all_bookings(conn)
        payments = get_all_payments(conn)
        
        # Подсчитываем статистику
        admin_count = len([u for u in users if u.get("role_id") == 1])
        organizer_count = len([u for u in users if u.get("role_id") == 2])
        participant_count = len([u for u in users if u.get("role_id") == 3])
        
        paid_payments = len([p for p in payments if p.get("payment_status") == "оплачено"])
        pending_payments = len(payments) - paid_payments
        
        stats = {
            "users_count": len(users),
            "events_count": len(events),
            "venues_count": len(venues),
            "teams_count": len(teams),
            "bookings_count": len(bookings),
            "payments_count": len(payments),
            "paid_payments": paid_payments,
            "pending_payments": pending_payments,
            "admin_count": admin_count,
            "organizer_count": organizer_count,
            "participant_count": participant_count
        }
        
        # Топ команд
        top_teams = sorted(teams, key=lambda x: x.get("rating", 0), reverse=True)[:10]
        
        # Статистика по мероприятиям
        event_bookings = {}
        for booking in bookings:
            event_name = booking.get("event_name")
            if event_name not in event_bookings:
                event_bookings[event_name] = 0
            event_bookings[event_name] += 1
        
        event_stats = []
        for event in events:
            event_stats.append({
                "event": event,
                "bookings_count": event_bookings.get(event.get("description"), 0)
            })
        
        return templates.TemplateResponse("admin/reports.html", {
            "request": request,
            "current_user": current_user,
            "stats": stats,
            "top_teams": top_teams,
            "event_stats": event_stats
        })
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ РЕЗУЛЬТАТАМИ ===

@router.get("/results", response_class=HTMLResponse)
def admin_results(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        events = get_all_events(conn)
        teams = get_all_teams(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/results.html", {
            "request": request,
            "current_user": current_user,
            "events": events,
            "teams": teams,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/results/add", response_class=RedirectResponse)
def admin_results_add(
    request: Request,
    event_id: int = Form(...),
    team_id: int = Form(...),
    score: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        result_data = {
            "event_id": event_id,
            "team_id": team_id,
            "score": score
        }
        
        create_event_result(conn, result_data)
        
        return RedirectResponse("/admin/results?success=added", status_code=302)
    finally:
        put_db(conn)

# === ОБЩИЙ ОБРАБОТЧИК УДАЛЕНИЯ ===

@router.post("/delete/{entity}/{entity_id}", response_class=RedirectResponse)
def delete_entity(
    entity: str,
    entity_id: int,
    request: Request,
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        if entity == "user":
            delete_user(conn, entity_id)
            return RedirectResponse("/admin/users?deleted=1", status_code=302)
        elif entity == "event":
            delete_event(conn, entity_id)
            return RedirectResponse("/admin/events?deleted=1", status_code=302)
        elif entity == "venue":
            delete_venue(conn, entity_id)
            return RedirectResponse("/admin/venues?deleted=1", status_code=302)
        elif entity == "team":
            delete_team(conn, entity_id)
            return RedirectResponse("/admin/teams?deleted=1", status_code=302)
        elif entity == "booking":
            delete_booking(conn, entity_id)
            return RedirectResponse("/admin/bookings?deleted=1", status_code=302)
        
        return RedirectResponse("/admin", status_code=302)
    finally:
        put_db(conn)

# === УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ МЕРОПРИЯТИЯ ===

@router.get("/events/{event_id}/bookings", response_class=HTMLResponse)
async def admin_event_bookings(
    event_id: int,
    request: Request,
    conn: psycopg2.extensions.connection = Depends(get_db)
):
    try:
        current_user = check_admin_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        # Получаем информацию о мероприятии
        event = get_event_by_id(conn, event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Мероприятие не найдено")
        
        # Получаем все бронирования для этого мероприятия
        all_bookings = get_all_bookings(conn)
        event_bookings = [b for b in all_bookings if b["event_id"] == event_id]
        
        # Получаем количество участников для каждой команды
        for booking in event_bookings:
            participants = get_participants_by_team_id(conn, booking["team_id"])
            booking["participant_count"] = len(participants)
            booking["participants"] = participants
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("admin/event_bookings.html", {
            "request": request,
            "current_user": current_user,
            "event": event[0],
            "bookings": event_bookings,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)