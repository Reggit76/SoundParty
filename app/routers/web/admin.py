# app/routers/web/admin.py
from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
from datetime import datetime

from app.core.security import decode_access_token
from app.core.csrf import get_csrf_token, csrf_protect_dependency
from app.repositories.user_repo import get_user_by_username, get_all_users, delete_user
from app.repositories.event_repo import get_all_events, create_event, delete_event
from app.repositories.venue_repo import get_all_venues, create_venue, delete_venue
from app.repositories.team_repo import get_all_teams, delete_team
from app.repositories.booking_repo import get_all_bookings
from app.repositories.payment_repo import get_all_payments
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["admin"])

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

@router.get("/admin", response_class=HTMLResponse)
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
        
        stats = {
            "users_count": len(users),
            "events_count": len(events),
            "venues_count": len(venues),
            "teams_count": len(teams),
            "bookings_count": len(bookings),
            "payments_count": len(payments),
            "paid_payments": len([p for p in payments if p.get("payment_status") == "оплачено"])
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

@router.get("/admin/users", response_class=HTMLResponse)
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

@router.get("/admin/events", response_class=HTMLResponse)
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

@router.post("/admin/events/create", response_class=RedirectResponse)
def create_event_admin(
    request: Request,
    venue_id: int = Form(...),
    description: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
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
            "venue_id": venue_id,
            "description": description,
            "date": date,
            "time": time,
            "max_teams": max_teams,
            "status": status
        }
        
        create_event(conn, event_data)
        
        return RedirectResponse("/admin/events?success=1", status_code=302)
    finally:
        put_db(conn)

@router.get("/admin/venues", response_class=HTMLResponse)
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

@router.post("/admin/venues/create", response_class=RedirectResponse)
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

@router.post("/admin/delete/{entity}/{entity_id}", response_class=RedirectResponse)
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
        
        return RedirectResponse("/admin", status_code=302)
    finally:
        put_db(conn)