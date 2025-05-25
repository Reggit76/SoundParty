# app/routers/web/profile.py
from fastapi import APIRouter, Depends, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, RedirectResponse
import psycopg2

from app.core.security import decode_access_token, hash_password, verify_password
from app.core.csrf import get_csrf_token, csrf_protect_dependency
from app.repositories.user_repo import get_user_by_username, update_user
from app.repositories.team_repo import get_all_teams
from app.repositories.participant_repo import get_all_participants
from app.database import get_db, put_db
from app.templates import templates

router = APIRouter(tags=["web"])

@router.get("/profile", response_class=HTMLResponse)
def profile_page(request: Request, conn: psycopg2.extensions.connection = Depends(get_db)):
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
        all_participants = get_all_participants(conn)
        user_teams = []
        
        for participant in all_participants:
            if participant.get("username") == current_user["username"]:
                user_teams.append({
                    "team_name": participant["team_name"],
                    "participant_id": participant["participant_id"]
                })
        
        csrf_token = get_csrf_token(request)
        
        return templates.TemplateResponse("profile.html", {
            "request": request,
            "current_user": current_user,
            "user_teams": user_teams,
            "csrf_token": csrf_token
        })
    finally:
        put_db(conn)

@router.post("/profile/update", response_class=RedirectResponse)
def update_profile(
    request: Request,
    fullname: str = Form(...),
    email: str = Form(...),
    current_password: str = Form(None),
    new_password: str = Form(None),
    confirm_password: str = Form(None),
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
        
        # Подготовка данных для обновления
        update_data = {
            "username": current_user["username"],
            "fullname": fullname,
            "email": email,
            "role_id": current_user["role_id"]
        }
        
        # Если пользователь хочет изменить пароль
        if current_password and new_password:
            if not verify_password(current_password, current_user["password_hash"]):
                csrf_token = get_csrf_token(request)
                return templates.TemplateResponse("profile.html", {
                    "request": request,
                    "current_user": current_user,
                    "error": "Неверный текущий пароль",
                    "csrf_token": csrf_token
                })
            
            if new_password != confirm_password:
                csrf_token = get_csrf_token(request)
                return templates.TemplateResponse("profile.html", {
                    "request": request,
                    "current_user": current_user,
                    "error": "Новые пароли не совпадают",
                    "csrf_token": csrf_token
                })
            
            update_data["password_hash"] = hash_password(new_password)
        else:
            update_data["password_hash"] = current_user["password_hash"]
        
        # Обновляем пользователя
        update_user(conn, current_user["user_id"], update_data)
        
        return RedirectResponse("/profile?success=1", status_code=302)
    finally:
        put_db(conn)