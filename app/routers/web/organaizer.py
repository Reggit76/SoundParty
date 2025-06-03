# app/routers/web/organizer.py
from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2
from datetime import datetime

from app.core.security import decode_access_token
from app.core.csrf import get_csrf_token, csrf_protect_dependency
from app.repositories.user_repo import get_user_by_username
from app.repositories.event_repo import get_all_events, create_event, update_event, delete_event
from app.repositories.venue_repo import get_all_venues
from app.repositories.booking_repo import get_all_bookings
from app.repositories.event_result_repo import create_event_result, get_event_results
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["organizer"])

def check_organizer_access(request: Request, conn: psycopg2.extensions.connection):
    """Проверяет, является ли пользователь организатором или администратором"""
    token = request.cookies.get("access_token")
    if not token:
        return None
    
    payload = decode_access_token(token)
    if not payload:
        return None
    
    username = payload.get("sub")
    user = get_user_by_username(conn, username)
    
    if not user or user[0]["role_id"] not in [1, 2]:  # 1 - админ, 2 - организатор
        return None
    
    return user[0]

@router.get("/organizer/events", response_class=HTMLResponse)
def organizer_events(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_organizer_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        events = get_all_events(conn)
        venues = get_all_venues(conn)
        
        # Добавляем информацию о датах
        current_date = datetime.now().date()
        for event in events:
            if isinstance(event["date"], str):
                event_date = datetime.strptime(event["date"], "%Y-%m-%d").date()
            else:
                event_date = event["date"]
            event["is_past"] = event_date < current_date
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("organaizer/events.html", {
            "request": request,
            "current_user": current_user,
            "events": events,
            "venues": venues,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/organizer/bookings", response_class=HTMLResponse)
def organizer_bookings(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_organizer_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        bookings = get_all_bookings(conn)
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("organaizer/bookings.html", {
            "request": request,
            "current_user": current_user,
            "bookings": bookings,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.get("/organizer/results", response_class=HTMLResponse)
def organizer_results(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_organizer_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        events = get_all_events(conn)
        
        # Получаем результаты для каждого мероприятия
        events_with_results = []
        for event in events:
            try:
                results = get_event_results(conn, event["event_id"])
                event["results"] = results or []
                events_with_results.append(event)
            except:
                event["results"] = []
                events_with_results.append(event)
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("organaizer/result.html", {
            "request": request,
            "current_user": current_user,
            "events": events_with_results,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/organizer/results/add", response_class=RedirectResponse)
def add_result(
    request: Request,
    event_id: int = Form(...),
    team_id: int = Form(...),
    score: int = Form(...),
    csrf_token: str = Form(...),
    conn: psycopg2.extensions.connection = Depends(get_db),
    _: None = Depends(csrf_protect_dependency)
):
    try:
        current_user = check_organizer_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        result_data = {
            "event_id": event_id,
            "team_id": team_id,
            "score": score
        }
        
        create_event_result(conn, result_data)
        
        return RedirectResponse("/organizer/results?success=1", status_code=302)
    except Exception as e:
        return RedirectResponse("/organizer/results?error=1", status_code=302)
    finally:
        put_db(conn)

@router.get("/organizer", response_class=HTMLResponse)
def organizer_dashboard(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
    try:
        current_user = check_organizer_access(request, conn)
        if not current_user:
            return RedirectResponse("/login", status_code=302)
        
        # Получаем статистику
        events = get_all_events(conn)
        bookings = get_all_bookings(conn)
        
        # Фильтруем активные мероприятия
        current_date = datetime.now().date()
        active_events = []
        completed_events = []
        
        for event in events:
            if isinstance(event["date"], str):
                event_date = datetime.strptime(event["date"], "%Y-%m-%d").date()
            else:
                event_date = event["date"]
            
            if event_date >= current_date:
                active_events.append(event)
            else:
                completed_events.append(event)
        
        stats = {
            "total_events": len(events),
            "active_events": len(active_events),
            "completed_events": len(completed_events),
            "total_bookings": len(bookings)
        }
        
        return templates.TemplateResponse("organaizer/dashboard.html", {
            "request": request,
            "current_user": current_user,
            "stats": stats,
            "recent_events": events[:5],
            "recent_bookings": bookings[:5]
        })
    finally:
        put_db(conn)